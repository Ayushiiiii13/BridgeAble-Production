import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const MeetingContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' }
  ]
};

export const MeetingProvider = ({ children }) => {
  const { user } = useAuth();

  // Meeting & Room States
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);

  // Media Streams & Hardware States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({}); // { [socketId]: MediaStream }
  const [screenStream, setScreenStream] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Participants & Communication
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [captions, setCaptions] = useState([]);
  const [latestSign, setLatestSign] = useState(null);

  // Accessibility Toggles
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [signLanguageEnabled, setSignLanguageEnabled] = useState(true);
  const [sttActive, setSttActive] = useState(false);
  const [sttError, setSttError] = useState('');
  const [speechLang, setSpeechLang] = useState('en-IN');

  // Speech Recognition States
  const [speechSupported, setSpeechSupported] = useState(false);
  const [interimCaption, setInterimCaption] = useState('');

  // Refs for stable asynchronous access
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // { [socketId]: RTCPeerConnection }
  const recognitionRef = useRef(null);
  const sttActiveRef = useRef(false);
  const currentMeetingRef = useRef(null);
  // Deduplication for sign messages: track last emitted sign + timestamp
  const lastSentSignRef = useRef({ sign: null, sentAt: 0 });

  // Keep refs synchronized
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);

  useEffect(() => {
    currentMeetingRef.current = currentMeeting;
  }, [currentMeeting]);

  // Check browser SpeechRecognition support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported(!!SpeechRecognition);
  }, []);

  // Meeting duration timer
  useEffect(() => {
    let timer;
    if (currentMeeting) {
      timer = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setMeetingDuration(0);
    }
    return () => clearInterval(timer);
  }, [currentMeeting]);

  // Initialize Real Camera & Mic MediaStream
  const initLocalStream = useCallback(async (audio = true, video = true) => {
    try {
      // If localStream already active, return it
      if (localStreamRef.current && localStreamRef.current.active) {
        localStreamRef.current.getAudioTracks().forEach(t => t.enabled = audio);
        localStreamRef.current.getVideoTracks().forEach(t => t.enabled = video);
        setMicEnabled(audio);
        setCameraEnabled(video);
        return localStreamRef.current;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          facingMode: 'user'
        }
      });

      stream.getAudioTracks().forEach(t => t.enabled = audio);
      stream.getVideoTracks().forEach(t => t.enabled = video);

      setLocalStream(stream);
      localStreamRef.current = stream;
      setMicEnabled(audio);
      setCameraEnabled(video);
      return stream;
    } catch (err) {
      console.warn('Camera/Microphone direct access not available:', err.message);
      // Create lightweight fallback canvas stream
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#422D1F';
      ctx.fillRect(0, 0, 640, 480);
      ctx.fillStyle = '#EADCC8';
      ctx.font = '24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(user?.name || 'Local User', 320, 240);

      const fallbackStream = canvas.captureStream(15);
      setLocalStream(fallbackStream);
      localStreamRef.current = fallbackStream;
      setMicEnabled(audio);
      setCameraEnabled(video);
      return fallbackStream;
    }
  }, [user]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      const nextState = !micEnabled;
      audioTracks.forEach(t => t.enabled = nextState);
      setMicEnabled(nextState);

      if (socketRef.current && currentMeetingRef.current) {
        const meetingCode = currentMeetingRef.current.meetingCode || currentMeetingRef.current._id;
        socketRef.current.emit('participant-status', {
          meetingId: meetingCode,
          userId: user?._id || 'local_user',
          micEnabled: nextState
        });
      }
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      const nextState = !cameraEnabled;
      videoTracks.forEach(t => t.enabled = nextState);
      setCameraEnabled(nextState);

      if (socketRef.current && currentMeetingRef.current) {
        const meetingCode = currentMeetingRef.current.meetingCode || currentMeetingRef.current._id;
        socketRef.current.emit('participant-status', {
          meetingId: meetingCode,
          userId: user?._id || 'local_user',
          cameraEnabled: nextState
        });
      }
    }
  };

  // Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
      }
      setScreenStream(null);
      setIsScreenSharing(false);
    } else {
      try {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setScreenStream(displayStream);
        setIsScreenSharing(true);

        displayStream.getVideoTracks()[0].onended = () => {
          setScreenStream(null);
          setIsScreenSharing(false);
        };
      } catch (err) {
        console.error('Screen sharing was cancelled or failed:', err);
      }
    }
  };

  // WebRTC Peer Connection Helper
  const createPeerConnection = useCallback((targetSocketId, isInitiator, meetingCode) => {
    if (peerConnections.current[targetSocketId]) {
      return peerConnections.current[targetSocketId];
    }

    const pc = new RTCPeerConnection(RTC_CONFIG);
    peerConnections.current[targetSocketId] = pc;

    // Attach local media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    // Handle ICE Candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          meetingId: meetingCode,
          candidate: event.candidate,
          to: targetSocketId
        });
      }
    };

    // Handle Remote Media Tracks
    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        setRemoteStreams((prev) => ({
          ...prev,
          [targetSocketId]: event.streams[0]
        }));
      }
    };

    // Connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        if (peerConnections.current[targetSocketId]) {
          try { peerConnections.current[targetSocketId].close(); } catch (e) {}
          delete peerConnections.current[targetSocketId];
        }
        setRemoteStreams((prev) => {
          const updated = { ...prev };
          delete updated[targetSocketId];
          return updated;
        });
      }
    };

    // If initiator, generate Offer
    if (isInitiator) {
      pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true })
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          if (socketRef.current) {
            socketRef.current.emit('offer', {
              meetingId: meetingCode,
              offer: pc.localDescription,
              to: targetSocketId,
              userName: user?.name || 'Participant'
            });
          }
        })
        .catch((err) => console.error('Error creating WebRTC offer:', err));
    }

    return pc;
  }, [user]);

  // Clean up a single peer connection
  const cleanupPeer = useCallback((socketId) => {
    if (peerConnections.current[socketId]) {
      try {
        peerConnections.current[socketId].close();
      } catch (e) {}
      delete peerConnections.current[socketId];
    }
    setRemoteStreams((prev) => {
      const updated = { ...prev };
      delete updated[socketId];
      return updated;
    });
  }, []);

  // Web Speech API for Real Live Speech-To-Text and Captions
  const startSpeechRecognition = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      setSttActive(false);
      setSttError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    setSpeechSupported(true);
    setSttError('');

    // Verify microphone hardware & permission
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const testStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        testStream.getAudioTracks().forEach(track => track.stop());
      }
    } catch (micErr) {
      console.warn('Microphone permission/access error for STT:', micErr.name, micErr.message);
      sttActiveRef.current = false;
      setSttActive(false);
      if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
        setSttError('Microphone permission denied. Please allow microphone access in browser settings.');
      } else if (micErr.name === 'NotFoundError' || micErr.name === 'DevicesNotFoundError') {
        setSttError('No microphone found. Please connect a microphone.');
      } else if (micErr.name === 'NotReadableError' || micErr.name === 'TrackStartError') {
        setSttError('Microphone is unavailable or in use by another application.');
      } else {
        setSttError(`Microphone access error: ${micErr.message}`);
      }
      return;
    }

    try {
      // Safely stop any previous instance
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang || 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        sttActiveRef.current = true;
        setSttActive(true);
        setSttError('');
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        const finalPhrases = [];

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (!res || !res[0]) continue;
          const transcript = res[0].transcript.trim();
          if (!transcript) continue;

          if (res.isFinal) {
            finalPhrases.push(transcript);
          } else {
            currentInterim += `${transcript} `;
          }
        }

        setInterimCaption(currentInterim.trim());

        if (finalPhrases.length > 0) {
          const finalTranscript = finalPhrases.join(' ').replace(/\s+/g, ' ').trim();
          if (finalTranscript) {
            const newCaption = {
              id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
              speaker: user?.name || 'You',
              speakerId: user?._id || 'self',
              text: finalTranscript,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              isFinal: true
            };

            setCaptions((prev) => [...prev.slice(-30), newCaption]);
            setInterimCaption('');

            // Broadcast to other participants via Socket.IO
            if (socketRef.current && currentMeetingRef.current) {
              const meetingCode = currentMeetingRef.current.meetingCode || currentMeetingRef.current._id;
              socketRef.current.emit('caption-message', {
                meetingId: meetingCode,
                text: finalTranscript,
                speaker: user?.name || 'You',
                speakerId: user?._id || 'self'
              });
            }
          }
        }
      };

      recognition.onerror = (e) => {
        const err = e.error;
        console.warn('SpeechRecognition event error:', err);
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          sttActiveRef.current = false;
          setSttActive(false);
          setSttError('Microphone permission denied. Please allow microphone in browser settings.');
          setInterimCaption('');
        } else if (err === 'audio-capture') {
          sttActiveRef.current = false;
          setSttActive(false);
          setSttError('No microphone found. Please connect audio device.');
          setInterimCaption('');
        } else if (err === 'network') {
          setSttError('Network connectivity issue with Speech Recognition service.');
        } else if (err === 'no-speech') {
          // No speech detected in chunk, continue listening
        } else if (err === 'aborted') {
          // User stopped manually
        }
      };

      recognition.onend = () => {
        setInterimCaption('');
        if (sttActiveRef.current) {
          // Auto restart continuous listening if still active
          try {
            recognition.start();
          } catch (err) {
            setTimeout(() => {
              if (sttActiveRef.current && recognitionRef.current) {
                try { recognitionRef.current.start(); } catch (e) {}
              }
            }, 300);
          }
        } else {
          setSttActive(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      sttActiveRef.current = false;
      setSttActive(false);
      setSttError('Failed to start speech recognition: ' + e.message);
    }
  }, [user, speechLang]);

  const stopSpeechRecognition = useCallback(() => {
    sttActiveRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setSttActive(false);
    setInterimCaption('');
  }, []);

  // Text-To-Speech function
  const speakText = (text, voiceIndex = 0) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && voices[voiceIndex]) {
      utterance.voice = voices[voiceIndex];
    }
    utterance.pitch = 1.0;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Send Chat Message
  const sendChatMessage = (text) => {
    if (!text || !text.trim()) return;
    const msgObj = {
      _id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      meeting: currentMeetingRef.current?.meetingCode || currentMeetingRef.current?._id,
      sender: user?._id || 'local_user',
      senderName: user?.name || 'You',
      message: text.trim(),
      type: 'chat',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, msgObj]);

    if (socketRef.current && currentMeetingRef.current) {
      const meetingCode = currentMeetingRef.current.meetingCode || currentMeetingRef.current._id;
      socketRef.current.emit('chat-message', {
        meetingId: meetingCode,
        message: text.trim(),
        sender: user?._id || 'local_user',
        senderName: user?.name || 'You'
      });
    }
  };

  // Broadcast Sign Translation
  // Deduplication: the same sign is not re-sent within 3 seconds to prevent
  // hundreds of identical transcript entries from one continuous gesture.
  const SIGN_DEBOUNCE_MS = 3000;

  const sendSignMessage = (sign, text, confidence) => {
    if (!sign || sign === 'No hand detected' || sign === 'Unrecognized gesture' || sign === 'AI unavailable') return;

    const now = Date.now();
    const last = lastSentSignRef.current;
    if (last.sign === sign && (now - last.sentAt) < SIGN_DEBOUNCE_MS) {
      // Same gesture still active — update UI display but do NOT re-emit to socket/DB
      setLatestSign({ sign, text, speaker: user?.name || 'You', confidence });
      return;
    }

    // New sign or enough time has passed — emit and persist
    lastSentSignRef.current = { sign, sentAt: now };

    const signMsg = {
      _id: `sign_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      meeting: currentMeetingRef.current?.meetingCode || currentMeetingRef.current?._id,
      sender: user?._id || 'local_user',
      senderName: user?.name || 'You',
      speaker: user?.name || 'You',
      sign,
      text: text || sign,
      message: `[${sign}] ${text || sign}`,
      confidence: confidence || 0.9,
      type: 'sign',
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, signMsg]);
    setLatestSign({ sign, text, speaker: user?.name || 'You', confidence });

    if (socketRef.current && currentMeetingRef.current) {
      const meetingCode = currentMeetingRef.current.meetingCode || currentMeetingRef.current._id;
      socketRef.current.emit('sign-message', {
        meetingId: meetingCode,
        sign,
        text: text || sign,
        speaker: user?.name || 'You',
        speakerId: user?._id,
        confidence: confidence || 0.9
      });
    }
  };

  // Join Meeting Room via Socket.IO
  const joinMeetingRoom = useCallback((meetingData) => {
    setCurrentMeeting(meetingData);
    currentMeetingRef.current = meetingData;
    const meetingCode = meetingData.meetingCode || meetingData._id;

    // Disconnect existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(SOCKET_URL, {
      reconnectionAttempts: 5,
      timeout: 8000,
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-meeting', {
        meetingId: meetingCode,
        userId: user?._id || 'user_' + Date.now(),
        userName: user?.name || 'Participant'
      });
    });

    // Received roster of existing participants in room
    socket.on('meeting-participants', ({ participants: remoteList }) => {
      const filtered = remoteList || [];
      setParticipants(filtered);

      // Create WebRTC connections for existing participants
      filtered.forEach((p) => {
        if (p.socketId && p.socketId !== socket.id) {
          createPeerConnection(p.socketId, true, meetingCode);
        }
      });
    });

    // When a new user joins
    socket.on('user-joined', ({ userName, socketId, userId, participants: updatedList }) => {
      if (updatedList) {
        setParticipants(updatedList);
      } else {
        setParticipants((prev) => [
          ...prev.filter(p => p.socketId !== socketId),
          { socketId, userId, userName, micEnabled: true, cameraEnabled: true, isSpeaking: false }
        ]);
      }
    });

    // When a user leaves
    socket.on('user-left', ({ socketId, participants: remainingList }) => {
      cleanupPeer(socketId);
      if (remainingList) {
        setParticipants(remainingList);
      } else {
        setParticipants((prev) => prev.filter(p => p.socketId !== socketId));
      }
    });

    // WebRTC: Handle incoming Offer
    socket.on('offer', async ({ offer, from, userName }) => {
      try {
        const pc = createPeerConnection(from, false, meetingCode);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('answer', {
          meetingId: meetingCode,
          answer: pc.localDescription,
          to: from
        });
      } catch (err) {
        console.error('Error handling WebRTC offer:', err);
      }
    });

    // WebRTC: Handle incoming Answer
    socket.on('answer', async ({ answer, from }) => {
      try {
        const pc = peerConnections.current[from];
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error('Error handling WebRTC answer:', err);
      }
    });

    // WebRTC: Handle incoming ICE Candidate
    socket.on('ice-candidate', async ({ candidate, from }) => {
      try {
        const pc = peerConnections.current[from];
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    // Chat listener
    socket.on('chat-message', (incoming) => {
      if (incoming.sender !== user?._id && incoming.sender !== socket.id) {
        setMessages((prev) => [...prev, incoming]);
      }
    });

    // Caption listener from remote participants
    socket.on('caption-message', (incoming) => {
      if (incoming.speakerId !== user?._id && incoming.speakerId !== 'self') {
        setCaptions((prev) => [
          ...prev.slice(-30),
          {
            id: incoming.id || (Date.now() + '_' + Math.random().toString(36).substr(2, 4)),
            speaker: incoming.speaker,
            speakerId: incoming.speakerId,
            text: incoming.text,
            timestamp: incoming.timestamp ? new Date(incoming.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            isFinal: true
          }
        ]);
      }
    });

    // Sign message listener
    socket.on('sign-message', (incoming) => {
      if (incoming.sender !== user?._id && incoming.speakerId !== user?._id) {
        setLatestSign(incoming);
        setMessages((prev) => [...prev, incoming]);
      }
    });

    // Participant media status update listener
    socket.on('participant-status', ({ socketId, micEnabled, cameraEnabled, isSpeaking }) => {
      setParticipants((prev) => prev.map((p) => {
        if (p.socketId === socketId) {
          return {
            ...p,
            ...(micEnabled !== undefined && { micEnabled }),
            ...(cameraEnabled !== undefined && { cameraEnabled }),
            ...(isSpeaking !== undefined && { isSpeaking })
          };
        }
        return p;
      }));
    });

    // Reset room communication state
    setParticipants([]);
    setMessages([]);
    setCaptions([]);
    setRemoteStreams({});

    if (captionsEnabled) {
      startSpeechRecognition();
    }
  }, [user, captionsEnabled, createPeerConnection, cleanupPeer, startSpeechRecognition]);

  // Leave Meeting & Clean up all resources
  const leaveMeeting = useCallback(() => {
    if (socketRef.current && currentMeetingRef.current) {
      const meetingCode = currentMeetingRef.current.meetingCode || currentMeetingRef.current._id;
      socketRef.current.emit('leave-meeting', {
        meetingId: meetingCode,
        userId: user?._id,
        userName: user?.name
      });
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Close all peer connections
    Object.keys(peerConnections.current).forEach((key) => {
      try {
        peerConnections.current[key].close();
      } catch (e) {}
    });
    peerConnections.current = {};
    setRemoteStreams({});

    // Stop local camera tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
      localStreamRef.current = null;
    }

    // Stop screen share
    if (screenStream) {
      screenStream.getTracks().forEach((track) => track.stop());
      setScreenStream(null);
      setIsScreenSharing(false);
    }

    stopSpeechRecognition();
    setCurrentMeeting(null);
    currentMeetingRef.current = null;
    setIsConnected(false);
    setParticipants([]);
    setMessages([]);
    setCaptions([]);
  }, [user, screenStream, stopSpeechRecognition]);

  // Cleanup Speech Recognition on unmount
  useEffect(() => {
    return () => {
      sttActiveRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        currentMeeting,
        setCurrentMeeting,
        isConnected,
        meetingDuration,
        localStream,
        remoteStreams,
        screenStream,
        micEnabled,
        cameraEnabled,
        isScreenSharing,
        participants,
        messages,
        captions,
        setCaptions,
        interimCaption,
        setInterimCaption,
        latestSign,
        captionsEnabled,
        setCaptionsEnabled,
        signLanguageEnabled,
        setSignLanguageEnabled,
        sttActive,
        sttError,
        setSttError,
        speechLang,
        setSpeechLang,
        speechSupported,
        initLocalStream,
        toggleMic,
        toggleCamera,
        toggleScreenShare,
        startSpeechRecognition,
        stopSpeechRecognition,
        speakText,
        sendChatMessage,
        sendSignMessage,
        joinMeetingRoom,
        leaveMeeting,
        socketRef,
        user,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => useContext(MeetingContext);
