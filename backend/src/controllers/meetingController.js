const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const Transcript = require('../models/Transcript');
const { meetingStore, transcriptStore } = require('../config/fileStore');
const { generateMeetingCode } = require('../utils/helpers');

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Compute the authoritative meeting status based on server time.
 * Uses: scheduledAt (start time) and duration (minutes).
 *
 * - Before scheduledAt              → 'scheduled'
 * - Between scheduledAt and end     → 'active'
 * - After scheduledAt + duration    → 'ended'
 * - Already explicitly 'ended'      → 'ended' (preserve host-ended state)
 */
function computeStatus(meeting) {
  // Respect an already explicitly ended meeting
  if (meeting.status === 'ended') return 'ended';

  const now = Date.now();
  const start = new Date(meeting.scheduledAt).getTime();
  const durationMs = (meeting.duration || 60) * 60 * 1000;
  const end = start + durationMs;

  if (now >= end) return 'ended';
  if (now >= start) return 'active';
  return 'scheduled';
}

/**
 * Apply computed status to a plain meeting object (from DB or fileStore).
 * Returns a new object with the corrected status field.
 */
function withComputedStatus(meeting) {
  const computed = computeStatus(meeting);
  // For Mongoose documents, .toObject() gives a plain JS object
  const plain = meeting.toObject ? meeting.toObject() : { ...meeting };
  plain.status = computed;
  return plain;
}

/**
 * Persist a status change back to MongoDB if the stored value differs.
 * Fire-and-forget — we don't await this on the critical path.
 */
async function syncStatusToDb(meeting, computed) {
  if (meeting.status !== computed) {
    try {
      const update = { status: computed };
      if (computed === 'ended' && !meeting.endedAt) {
        update.endedAt = new Date();
      }
      await Meeting.findByIdAndUpdate(meeting._id, update);
    } catch (e) {
      console.warn('[meetingController] Status sync error:', e.message);
    }
  }
}

const createMeeting = async (req, res) => {
  try {
    const { title, description, scheduledAt, duration, settings } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Meeting title is required' });
    }

    const meetingCode = generateMeetingCode();

    if (isDbConnected()) {
      const meeting = await Meeting.create({
        title: title.trim(),
        description: description ? description.trim() : '',
        meetingCode,
        host: req.user._id,
        scheduledAt: scheduledAt || new Date(),
        duration: duration || 60,
        status: 'scheduled',
        settings: {
          chatEnabled: settings?.chatEnabled !== false,
          screenShareEnabled: settings?.screenShareEnabled !== false,
          captionsEnabled: settings?.captionsEnabled !== false,
          signLanguageEnabled: settings?.signLanguageEnabled !== false,
          recordingEnabled: settings?.recordingEnabled || false
        }
      });

      await Transcript.create({ meeting: meeting._id, entries: [] });
      const populated = await Meeting.findById(meeting._id).populate('host', 'name email avatar');

      return res.status(201).json({
        message: 'Meeting created successfully',
        meeting: withComputedStatus(populated)
      });
    }

    // Persistent file store
    const meeting = meetingStore.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      meetingCode,
      host: { _id: req.user._id, name: req.user.name, email: req.user.email },
      participants: [{ user: req.user._id, name: req.user.name, joinedAt: new Date().toISOString() }],
      scheduledAt: scheduledAt || new Date().toISOString(),
      duration: duration || 60,
      status: 'scheduled',
      settings: {
        chatEnabled: settings?.chatEnabled !== false,
        screenShareEnabled: settings?.screenShareEnabled !== false,
        captionsEnabled: settings?.captionsEnabled !== false,
        signLanguageEnabled: settings?.signLanguageEnabled !== false,
        recordingEnabled: settings?.recordingEnabled || false
      }
    });

    transcriptStore.create({ meeting: meeting._id, entries: [] });

    return res.status(201).json({
      message: 'Meeting created successfully',
      meeting: withComputedStatus(meeting)
    });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error creating meeting: ' + error.message });
  }
};

const getMeetings = async (req, res) => {
  try {
    if (isDbConnected()) {
      const meetings = await Meeting.find({
        $or: [
          { host: req.user._id },
          { 'participants.user': req.user._id }
        ]
      })
        .populate('host', 'name email avatar')
        .sort({ scheduledAt: -1 })
        .limit(50);

      // Recalculate status for each meeting and persist changes back to DB
      const computed = meetings.map((m) => {
        const status = computeStatus(m);
        // Async write-back — does not block the response
        syncStatusToDb(m, status);
        return withComputedStatus(m);
      });

      return res.json({ meetings: computed });
    }

    const all = meetingStore.find();
    const userMeetings = all.filter(m =>
      (m.host && (m.host._id === req.user._id || m.host === req.user._id)) ||
      (m.participants && m.participants.some(p => p.user === req.user._id || p.name === req.user.name))
    );

    return res.json({ meetings: userMeetings.map(withComputedStatus) });
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server error fetching meetings: ' + error.message });
  }
};

const getMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const queryCode = id.toUpperCase().trim();

    if (isDbConnected()) {
      let meeting = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        meeting = await Meeting.findById(id)
          .populate('host', 'name email avatar')
          .populate('participants.user', 'name email avatar');
      }

      if (!meeting) {
        meeting = await Meeting.findOne({ meetingCode: queryCode })
          .populate('host', 'name email avatar')
          .populate('participants.user', 'name email avatar');
      }

      if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

      // Compute and persist status
      const status = computeStatus(meeting);
      syncStatusToDb(meeting, status);

      return res.json({ meeting: withComputedStatus(meeting) });
    }

    const found = meetingStore.findOne({ meetingCode: queryCode }) || meetingStore.findById(id);
    if (!found) return res.status(404).json({ message: 'Meeting not found' });
    return res.json({ meeting: withComputedStatus(found) });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Server error fetching meeting: ' + error.message });
  }
};

const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (isDbConnected()) {
      const meeting = await Meeting.findOneAndUpdate(
        { _id: id, host: req.user._id },
        updates,
        { new: true, runValidators: true }
      ).populate('host', 'name email avatar');

      if (!meeting) return res.status(404).json({ message: 'Meeting not found or unauthorized' });
      return res.json({ message: 'Meeting updated', meeting: withComputedStatus(meeting) });
    }

    const updated = meetingStore.findByIdAndUpdate(id, updates);
    if (!updated) return res.status(404).json({ message: 'Meeting not found' });
    return res.json({ message: 'Meeting updated', meeting: withComputedStatus(updated) });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Server error updating meeting: ' + error.message });
  }
};

const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const meeting = await Meeting.findOneAndDelete({ _id: id, host: req.user._id });
      if (!meeting) return res.status(404).json({ message: 'Meeting not found or unauthorized' });
      return res.json({ message: 'Meeting deleted successfully' });
    }

    meetingStore.findOneAndDelete({ _id: id });
    return res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Server error deleting meeting: ' + error.message });
  }
};

const joinMeeting = async (req, res) => {
  try {
    const { meetingCode } = req.body;
    if (!meetingCode) return res.status(400).json({ message: 'Meeting code is required' });
    const code = meetingCode.toUpperCase().trim();

    if (isDbConnected()) {
      let meeting = await Meeting.findOne({ meetingCode: code }).populate('host', 'name email avatar');
      if (!meeting && mongoose.Types.ObjectId.isValid(meetingCode)) {
        meeting = await Meeting.findById(meetingCode).populate('host', 'name email avatar');
      }

      if (!meeting) return res.status(404).json({ message: 'Meeting not found with provided code' });

      // Block joining expired meetings
      const status = computeStatus(meeting);
      syncStatusToDb(meeting, status);
      if (status === 'ended') {
        return res.status(403).json({
          message: 'This meeting has ended and cannot be joined.',
          status: 'ended'
        });
      }

      if (req.user && req.user._id) {
        const alreadyParticipant = meeting.participants.some(p => p.user && p.user.toString() === req.user._id.toString());
        if (!alreadyParticipant) {
          meeting.participants.push({
            user: req.user._id,
            name: req.user.name,
            joinedAt: new Date()
          });
          await meeting.save();
        }
      }

      return res.json({ message: 'Joined meeting', meeting: withComputedStatus(meeting) });
    }

    const meeting = meetingStore.findOne({ meetingCode: code }) || meetingStore.findById(code);
    if (!meeting) return res.status(404).json({ message: 'Meeting not found with provided code' });

    // Block joining expired meetings (file store)
    const status = computeStatus(meeting);
    if (status === 'ended') {
      return res.status(403).json({
        message: 'This meeting has ended and cannot be joined.',
        status: 'ended'
      });
    }

    if (req.user && req.user._id) {
      if (!meeting.participants) meeting.participants = [];
      const already = meeting.participants.some(p => p.user === req.user._id);
      if (!already) {
        meeting.participants.push({
          user: req.user._id,
          name: req.user.name,
          joinedAt: new Date().toISOString()
        });
        meetingStore.findByIdAndUpdate(meeting._id, { participants: meeting.participants });
      }
    }

    return res.json({ message: 'Joined meeting', meeting: withComputedStatus(meeting) });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ message: 'Server error joining meeting: ' + error.message });
  }
};

const getTranscript = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Transcript] Fetching transcript for meeting: ${id}`);

    if (isDbConnected()) {
      let meetingId = id;

      // If not a valid ObjectId, look up by meeting code
      if (!mongoose.Types.ObjectId.isValid(id)) {
        const found = await Meeting.findOne({ meetingCode: id.toUpperCase() }).select('_id').lean();
        if (found) {
          meetingId = found._id.toString();
          console.log(`[Transcript] Resolved meeting code ${id} → ObjectId ${meetingId}`);
        } else {
          console.warn(`[Transcript] Meeting not found for id/code: ${id}`);
          return res.json({ transcript: { meeting: id, entries: [] } });
        }
      }

      let transcript = await Transcript.findOne({ meeting: meetingId }).lean();
      if (!transcript) {
        console.log(`[Transcript] No transcript document found for meeting ${meetingId}, returning empty`);
        transcript = { meeting: meetingId, entries: [] };
      } else {
        // Sort entries ascending by timestamp
        transcript.entries = (transcript.entries || []).sort(
          (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
        );
        console.log(`[Transcript] Found ${transcript.entries.length} entries for meeting ${meetingId}`);
      }

      return res.json({ transcript });
    }

    // File store fallback
    const transcript = transcriptStore.findOne({ meeting: id }) || { meeting: id, entries: [] };
    return res.json({ transcript });
  } catch (error) {
    console.error('Get transcript error:', error);
    res.status(500).json({ message: 'Server error fetching transcript: ' + error.message });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  getTranscript
};
