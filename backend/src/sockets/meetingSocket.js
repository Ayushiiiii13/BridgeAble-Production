const Message = require('../models/Message');
const Transcript = require('../models/Transcript');
const Meeting = require('../models/Meeting');
const { messageStore, transcriptStore } = require('../config/fileStore');
const mongoose = require('mongoose');

// Track active meeting rooms: Map<meetingId, Map<socketId, participantData>>
const meetingRooms = new Map();

// Cache: meetingCode/roomId → MongoDB ObjectId string
// Avoids one DB lookup per socket event
const meetingIdCache = new Map();

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Resolve a roomId (which may be a meeting code like "BRG-82K4-XP" or an ObjectId string)
 * to a MongoDB ObjectId string.  Returns null if not found.
 */
async function resolveMeetingObjectId(roomId) {
  if (!roomId) return null;

  // Check cache first
  if (meetingIdCache.has(roomId)) {
    return meetingIdCache.get(roomId);
  }

  // If it's already a valid ObjectId, use it directly
  if (mongoose.Types.ObjectId.isValid(roomId)) {
    meetingIdCache.set(roomId, roomId);
    return roomId;
  }

  // Look up by meetingCode
  try {
    const meeting = await Meeting.findOne({ meetingCode: roomId.toUpperCase().trim() }).select('_id').lean();
    if (meeting) {
      const idStr = meeting._id.toString();
      meetingIdCache.set(roomId, idStr);
      return idStr;
    }
  } catch (e) {
    console.warn('[Socket] resolveMeetingObjectId error:', e.message);
  }

  return null;
}

/**
 * Persist a transcript entry to MongoDB.
 * meetingObjectId must be a valid MongoDB ObjectId string.
 */
async function persistTranscriptEntry(meetingObjectId, entry) {
  try {
    const result = await Transcript.findOneAndUpdate(
      { meeting: meetingObjectId },
      {
        $push: {
          entries: {
            speaker: entry.speaker,
            speakerId: mongoose.Types.ObjectId.isValid(entry.speakerId) ? entry.speakerId : undefined,
            type: entry.type,
            text: entry.text,
            confidence: entry.confidence !== undefined ? entry.confidence : null,
            timestamp: entry.timestamp ? new Date(entry.timestamp) : new Date()
          }
        }
      },
      { upsert: true, new: true }
    );
    console.log(`[Transcript] Saved ${entry.type} entry for meeting ${meetingObjectId} (${result.entries.length} total)`);
  } catch (e) {
    console.warn('[Transcript] persistTranscriptEntry error:', e.message);
  }
}

const setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.id}`);

    // Join meeting room
    socket.on('join-meeting', ({ meetingId, userId, userName }) => {
      if (!meetingId) return;
      socket.join(meetingId);

      if (!meetingRooms.has(meetingId)) {
        meetingRooms.set(meetingId, new Map());
      }

      const room = meetingRooms.get(meetingId);
      const participant = {
        userId: userId || `user_${Date.now()}`,
        userName: userName || 'Participant',
        socketId: socket.id,
        micEnabled: true,
        cameraEnabled: true,
        isSpeaking: false,
        joinedAt: new Date().toISOString()
      };

      room.set(socket.id, participant);

      // Send existing participants to the new joiner
      const currentParticipants = Array.from(room.values());
      socket.emit('meeting-participants', {
        participants: currentParticipants
      });

      // Broadcast new participant to others in the room
      socket.to(meetingId).emit('user-joined', {
        userId: participant.userId,
        userName: participant.userName,
        socketId: socket.id,
        participants: currentParticipants
      });

      console.log(`[Socket] ${participant.userName} (${socket.id}) joined room ${meetingId}. Room count: ${room.size}`);
    });

    // WebRTC Signaling: Offer
    socket.on('offer', ({ meetingId, offer, to, userName }) => {
      if (!to) return;
      socket.to(to).emit('offer', {
        offer,
        from: socket.id,
        userName: userName || 'Peer'
      });
    });

    // WebRTC Signaling: Answer
    socket.on('answer', ({ meetingId, answer, to }) => {
      if (!to) return;
      socket.to(to).emit('answer', {
        answer,
        from: socket.id
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('ice-candidate', ({ meetingId, candidate, to }) => {
      if (!to) return;
      socket.to(to).emit('ice-candidate', {
        candidate,
        from: socket.id
      });
    });

    // =========================================================
    // CHAT MESSAGE
    // Persisted to: Message collection + Transcript entries
    // =========================================================
    socket.on('chat-message', async ({ meetingId, message, sender, senderName }) => {
      if (!meetingId || !message) return;
      const chatMsg = {
        _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        meeting: meetingId,
        sender: sender || socket.id,
        senderName: senderName || 'Participant',
        message: message.trim(),
        type: 'chat',
        timestamp: new Date().toISOString()
      };

      if (isDbConnected()) {
        try {
          // Resolve meeting code → ObjectId
          const meetingObjectId = await resolveMeetingObjectId(meetingId);

          if (meetingObjectId) {
            // Persist to Message collection
            await Message.create({
              meeting: meetingObjectId,
              sender: mongoose.Types.ObjectId.isValid(sender) ? sender : undefined,
              senderName: chatMsg.senderName,
              message: chatMsg.message,
              type: 'chat'
            });
            console.log(`[Transcript] Creating chat entry for meeting ${meetingObjectId}`);

            // Persist to Transcript entries
            await persistTranscriptEntry(meetingObjectId, {
              speaker: chatMsg.senderName,
              speakerId: sender,
              type: 'chat',
              text: chatMsg.message,
              timestamp: new Date()
            });
          } else {
            console.warn(`[Transcript] Could not resolve meeting ID for room: ${meetingId}`);
          }
        } catch (e) {
          console.warn('[Socket] Chat message DB save error:', e.message);
        }
      } else {
        // File store fallback
        messageStore.create(chatMsg);
        const transcript = transcriptStore.findOne({ meeting: meetingId });
        if (transcript) {
          if (!transcript.entries) transcript.entries = [];
          transcript.entries.push({ speaker: chatMsg.senderName, text: chatMsg.message, type: 'chat', timestamp: new Date().toISOString() });
          transcriptStore.findByIdAndUpdate(transcript._id, { entries: transcript.entries });
        }
      }

      // Broadcast to everyone in the room (including sender for confirmation)
      io.to(meetingId).emit('chat-message', chatMsg);
    });

    // =========================================================
    // CAPTION (SPEECH-TO-TEXT) — only finalized results
    // Persisted to: Transcript entries as type 'speech'
    // =========================================================
    socket.on('caption-message', async ({ meetingId, text, speaker, speakerId }) => {
      if (!meetingId || !text) return;
      const captionMsg = {
        id: Date.now(),
        speaker: speaker || 'Participant',
        speakerId: speakerId || socket.id,
        text: text.trim(),
        type: 'speech',
        timestamp: new Date().toISOString()
      };

      if (isDbConnected()) {
        try {
          const meetingObjectId = await resolveMeetingObjectId(meetingId);
          if (meetingObjectId) {
            console.log(`[Transcript] Creating speech entry for meeting ${meetingObjectId}`);
            await persistTranscriptEntry(meetingObjectId, {
              speaker: captionMsg.speaker,
              speakerId: speakerId,
              type: 'speech',
              text: captionMsg.text,
              timestamp: new Date()
            });
          } else {
            console.warn(`[Transcript] Could not resolve meeting ID for room: ${meetingId}`);
          }
        } catch (e) {
          console.warn('[Socket] Caption transcript save error:', e.message);
        }
      } else {
        const transcript = transcriptStore.findOne({ meeting: meetingId });
        if (transcript) {
          if (!transcript.entries) transcript.entries = [];
          transcript.entries.push(captionMsg);
          transcriptStore.findByIdAndUpdate(transcript._id, { entries: transcript.entries });
        }
      }

      io.to(meetingId).emit('caption-message', captionMsg);
    });

    // =========================================================
    // SIGN LANGUAGE — only real AI results above threshold
    // Persisted to: Message collection + Transcript entries as type 'sign'
    // =========================================================
    socket.on('sign-message', async ({ meetingId, sign, text, speaker, speakerId, confidence }) => {
      if (!meetingId || !sign) return;
      const signMsg = {
        _id: `sign_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        meeting: meetingId,
        speaker: speaker || 'Participant',
        speakerId: speakerId || socket.id,
        senderName: speaker || 'Participant',
        sender: speakerId || socket.id,
        sign,
        text: text || sign,
        message: `[${sign}] ${text || sign}`,
        confidence: confidence || 0.9,
        type: 'sign',
        timestamp: new Date().toISOString()
      };

      if (isDbConnected()) {
        try {
          const meetingObjectId = await resolveMeetingObjectId(meetingId);
          if (meetingObjectId) {
            // Persist to Message collection
            await Message.create({
              meeting: meetingObjectId,
              sender: mongoose.Types.ObjectId.isValid(speakerId) ? speakerId : undefined,
              senderName: signMsg.senderName,
              message: signMsg.message,
              type: 'sign'
            });
            console.log(`[Transcript] Creating sign entry for meeting ${meetingObjectId}`);

            // Persist to Transcript entries
            await persistTranscriptEntry(meetingObjectId, {
              speaker: signMsg.speaker,
              speakerId: speakerId,
              type: 'sign',
              text: `${text || sign}`,
              confidence: confidence || null,
              timestamp: new Date()
            });
          } else {
            console.warn(`[Transcript] Could not resolve meeting ID for room: ${meetingId}`);
          }
        } catch (e) {
          console.warn('[Socket] Sign transcript save error:', e.message);
        }
      } else {
        messageStore.create(signMsg);
        const transcript = transcriptStore.findOne({ meeting: meetingId });
        if (transcript) {
          if (!transcript.entries) transcript.entries = [];
          transcript.entries.push({ speaker: signMsg.speaker, text: `[${sign}] ${text || sign}`, type: 'sign', timestamp: new Date().toISOString() });
          transcriptStore.findByIdAndUpdate(transcript._id, { entries: transcript.entries });
        }
      }

      io.to(meetingId).emit('sign-message', signMsg);
    });

    // Participant media status toggle (mic / camera / speaking)
    socket.on('participant-status', ({ meetingId, userId, micEnabled, cameraEnabled, isSpeaking }) => {
      if (!meetingId) return;
      if (meetingRooms.has(meetingId)) {
        const room = meetingRooms.get(meetingId);
        const participant = room.get(socket.id);
        if (participant) {
          if (micEnabled !== undefined) participant.micEnabled = micEnabled;
          if (cameraEnabled !== undefined) participant.cameraEnabled = cameraEnabled;
          if (isSpeaking !== undefined) participant.isSpeaking = isSpeaking;
        }
      }

      socket.to(meetingId).emit('participant-status', {
        userId,
        socketId: socket.id,
        micEnabled,
        cameraEnabled,
        isSpeaking
      });
    });

    // Explicit leave meeting
    socket.on('leave-meeting', ({ meetingId, userId, userName }) => {
      if (meetingId && meetingRooms.has(meetingId)) {
        const room = meetingRooms.get(meetingId);
        room.delete(socket.id);
        socket.leave(meetingId);

        const remaining = Array.from(room.values());
        if (room.size === 0) {
          meetingRooms.delete(meetingId);
        } else {
          socket.to(meetingId).emit('user-left', {
            userId: userId || socket.id,
            userName: userName || 'Participant',
            socketId: socket.id,
            participants: remaining
          });
        }
        console.log(`[Socket] ${userName || socket.id} left meeting ${meetingId}. Remaining: ${room.size}`);
      }
    });

    // Disconnect event
    socket.on('disconnect', () => {
      for (const [meetingId, room] of meetingRooms.entries()) {
        if (room.has(socket.id)) {
          const participant = room.get(socket.id);
          room.delete(socket.id);

          const remaining = Array.from(room.values());
          if (room.size === 0) {
            meetingRooms.delete(meetingId);
          } else {
            io.to(meetingId).emit('user-left', {
              userId: participant.userId,
              userName: participant.userName,
              socketId: socket.id,
              participants: remaining
            });
          }
          console.log(`[Socket] Disconnected: ${participant.userName} (${socket.id}) removed from room ${meetingId}`);
        }
      }
    });
  });
};

module.exports = setupSocketHandlers;
