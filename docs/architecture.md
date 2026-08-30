# Architecture Documentation

## System Overview

BridgeAble is a three-tier application consisting of a React frontend, a Node.js backend, and a Python AI module.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                          │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  React App  │  │  WebRTC API  │  │  Web Speech API        │ │
│  │  (Vite)     │  │  getUserMedia │  │  SpeechRecognition     │ │
│  │             │  │  RTCPeer     │  │  SpeechSynthesis       │ │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘ │
│         │                │                                      │
│         │  Socket.IO     │  P2P Media                           │
│         │  Client        │  Streams                             │
└─────────┼────────────────┼──────────────────────────────────────┘
          │                │
          ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND SERVER                             │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  Express.js │  │  Socket.IO   │  │  JWT Auth              │ │
│  │  REST API   │  │  Server      │  │  Middleware            │ │
│  │             │  │  Signaling   │  │                        │ │
│  └──────┬──────┘  └──────────────┘  └────────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │  Mongoose   │                                                │
│  │  ODM        │                                                │
│  └──────┬──────┘                                                │
└─────────┼───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────┐
│    MongoDB      │
│    Database     │
│                 │
│  Collections:   │
│  - users        │
│  - meetings     │
│  - messages     │
│  - transcripts  │
└─────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      AI MODULE                                  │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │  FastAPI    │  │  MediaPipe   │  │  TensorFlow            │ │
│  │  Server     │  │  Hands       │  │  Gesture Classifier    │ │
│  │  Port 8000  │  │  Landmarks   │  │  (Demo Mode)           │ │
│  └─────────────┘  └──────────────┘  └────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Meeting Room

### 1. Video/Audio Stream
```
User Camera/Mic
  → getUserMedia()
    → Local MediaStream
      → RTCPeerConnection (WebRTC)
        → Remote Peer receives stream
```

### 2. Signaling (Socket.IO)
```
User A joins meeting
  → Socket: join-meeting { meetingId, userId }
    → Server broadcasts: user-joined
      → User B creates RTCPeerConnection
        → User B sends: offer (SDP)
          → Server relays to User A
            → User A sends: answer (SDP)
              → Server relays to User B
                → ICE candidates exchanged
                  → P2P connection established
```

### 3. Live Captions
```
User speaks
  → Web Speech API (SpeechRecognition)
    → Recognized text
      → Socket: caption-message { text, speaker }
        → Server broadcasts to meeting room
          → All participants see caption
            → Saved to transcript
```

### 4. Sign Language Recognition
```
User opens Sign Language panel
  → Camera captures frame
    → Frame sent to AI Module (HTTP POST)
      → MediaPipe extracts hand landmarks
        → TensorFlow classifies gesture
          → Returns: { sign, confidence, text }
            → User clicks "Send to Meeting"
              → Socket: sign-message { sign, text }
                → Broadcast to participants
                  → Saved to transcript
```

### 5. Text-to-Speech
```
User types message in TTS panel
  → Clicks "Speak"
    → window.speechSynthesis.speak()
      → Audio output through speaker
```

### 6. Chat
```
User types chat message
  → Socket: chat-message { message, sender }
    → Server saves to MongoDB
      → Server broadcasts to meeting room
        → All participants see message
          → Saved to transcript
```

---

## Database Schema

### Users
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  role: String,
  accessibilityPreferences: {
    captionsEnabled: Boolean,
    signLanguageEnabled: Boolean,
    speechToTextEnabled: Boolean,
    textToSpeechEnabled: Boolean,
    highContrast: Boolean,
    largeText: Boolean,
    reduceMotion: Boolean,
    captionFontSize: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Meetings
```
{
  title: String,
  description: String,
  meetingCode: String (unique),
  host: ObjectId (User),
  participants: [{ user: ObjectId, joinedAt: Date, leftAt: Date }],
  scheduledAt: Date,
  duration: Number (minutes),
  status: String (scheduled|active|ended),
  settings: {
    chatEnabled: Boolean,
    screenShareEnabled: Boolean,
    captionsEnabled: Boolean,
    signLanguageEnabled: Boolean,
    recordingEnabled: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Messages
```
{
  meeting: ObjectId,
  sender: ObjectId (User),
  senderName: String,
  message: String,
  type: String (chat|caption|sign|system),
  timestamp: Date
}
```

### Transcripts
```
{
  meeting: ObjectId,
  entries: [{
    speaker: String,
    type: String (speech|sign|chat),
    text: String,
    timestamp: Date
  }]
}
```

---

## Security

- **Authentication**: JWT tokens with expiry
- **Password Hashing**: bcrypt with salt rounds
- **CORS**: Restricted to frontend origin
- **Rate Limiting**: express-rate-limit on API routes
- **Helmet**: HTTP security headers
- **Input Validation**: express-validator on all endpoints
- **Protected Routes**: JWT middleware on authenticated routes
