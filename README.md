# BridgeAble Frontend

> **Breaking barriers. Building connections.**

An accessibility-first video conferencing platform built with **React + Vite + Tailwind CSS**.

## 🚀 Features

- 🎥 **Accessible Video Meetings** — Create, schedule, and join meetings
- 📝 **Live Captions** — Real-time speech-to-text overlay in meetings
- 🤟 **Sign Language Support** — Camera-based gesture recognition panel (AI integration ready)
- 🎙️ **Speech to Text** — Web Speech API powered dictation in chat
- 🔊 **Text to Speech** — Browser Speech Synthesis for message playback
- 💬 **Accessible Chat** — In-meeting messaging with accessibility tools
- 📅 **Calendar** — Monthly view with meeting scheduling
- 👥 **Contacts** — Team directory with invite to meeting actions
- 📜 **Transcript Viewer** — Searchable meeting transcripts

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Routing | React Router v6 |
| Icons | Lucide React |
| Speech | Web Speech API + SpeechSynthesis |
| State | React useState / localStorage |

## 📁 Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/              # All page components
│   ├── Home.jsx        # Landing page
│   ├── Dashboard.jsx   # Main dashboard + layout
│   ├── Meetings.jsx    # Meetings list
│   ├── CreateMeeting.jsx
│   ├── JoinMeeting.jsx # Pre-join screen
│   ├── MeetingRoom.jsx # ⭐ Core video conference room
│   ├── Calendar.jsx
│   ├── Contacts.jsx
│   ├── History.jsx
│   ├── Transcript.jsx
│   └── Profile.jsx
└── services/
    └── api.js          # Mock API — replace with real backend calls
```

## ⚡ Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

**Demo login:** any email + any password

## 🔌 Backend Integration

All API calls are mocked in `src/services/api.js`. Replace each function with real HTTP/WebSocket calls:

```js
createMeeting(data)         // POST /api/meetings
getMeetings()               // GET /api/meetings
joinMeeting(meetingId)      // POST /api/meetings/:id/join
getParticipants(meetingId)  // GET /api/meetings/:id/participants
getMessages(meetingId)      // GET /api/meetings/:id/messages
sendMessage(id, text)       // POST /api/meetings/:id/messages
getTranscript(meetingId)    // GET /api/meetings/:id/transcript
saveAccessibilityPreferences(prefs)
```

## 🤖 AI Integration Points

- **Sign Language**: `MeetingRoom.jsx` → `startSignCamera()` → replace `api.translateSign()` with real MediaPipe/TensorFlow output
- **Live Captions**: Captions panel in `MeetingRoom.jsx` — connect to backend STT streaming WebSocket

## 👥 Team

Built by the BridgeAble frontend team.
