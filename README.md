# 🌉 BridgeAble — Meet Without Barriers

**BridgeAble** is an accessibility-first online meeting and video-conferencing platform designed to help deaf, mute/non-speaking, and hearing users communicate together seamlessly.

Think: **Google Meet / Zoom** — but designed from the beginning for accessible communication.

---

## ✨ Features

- **Accessible Video Meetings** — Create, schedule, and join meetings with WebRTC
- **Live Captions** — Real-time speech-to-text captions using the Web Speech API
- **Sign Language Support** — AI-powered sign language recognition via MediaPipe + TensorFlow
- **Speech-to-Text** — Convert spoken words to text in real time
- **Text-to-Speech** — Type messages and have them spoken aloud
- **Accessible Chat** — Real-time meeting chat with Socket.IO
- **Meeting Transcripts** — Combined speech, sign, and chat transcripts
- **Screen Sharing** — Share your screen with participants
- **Accessibility Preferences** — Per-user settings for captions, contrast, font size, and more
- **Meeting History & Calendar** — View past and upcoming meetings

---

## 🏗️ Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Backend    │────▶│   MongoDB    │
│  React/Vite  │     │  Express.js  │     │              │
│  Port: 5173  │     │  Port: 5000  │     │  Port: 27017 │
└──────┬───────┘     └──────┬───────┘     └──────────────┘
       │                    │
       │  WebRTC + Socket.IO│
       │◀──────────────────▶│
       │
       │  HTTP
       ▼
┌──────────────┐
│  AI Module   │
│   FastAPI    │
│  Port: 8000  │
│  MediaPipe   │
│  TensorFlow  │
└──────────────┘
```

---

## 📁 Folder Structure

```
BridgeAble/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── layouts/      # Layout wrappers
│   │   ├── context/      # React contexts (Auth, Meeting)
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API service layer
│   │   ├── utils/        # Utility functions
│   │   └── data/         # Mock/demo data
│   └── package.json
│
├── backend/           # Node.js + Express + MongoDB
│   ├── src/
│   │   ├── config/       # Database & app config
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, validation, error handling
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # Express routes
│   │   ├── services/     # Business logic
│   │   ├── sockets/      # Socket.IO event handlers
│   │   ├── utils/        # Helpers
│   │   └── server.js     # Entry point
│   └── package.json
│
├── ai-module/         # Python + FastAPI + MediaPipe
│   ├── app/
│   │   ├── main.py       # FastAPI app
│   │   ├── config.py     # Configuration
│   │   ├── routes/       # API routes
│   │   ├── services/     # Gesture recognition services
│   │   ├── models/       # Pydantic models
│   │   └── utils/        # Utility functions
│   ├── models/           # TensorFlow model files
│   └── requirements.txt
│
├── docs/              # Documentation
│   └── architecture.md
│
├── .gitignore
└── README.md
```

---

## 🛠️ Technologies

| Layer       | Technologies                                            |
|-------------|---------------------------------------------------------|
| Frontend    | React, Vite, Tailwind CSS, React Router, Lucide React   |
| Backend     | Node.js, Express.js, MongoDB, Mongoose, Socket.IO, JWT  |
| AI Module   | Python, FastAPI, OpenCV, MediaPipe, TensorFlow           |
| Real-time   | WebRTC, Socket.IO, Web Speech API, Speech Synthesis API  |

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** v18+ and npm
- **Python** 3.9+
- **MongoDB** (local or Atlas)

### 1. Clone the repository

```bash
git clone <repo-url>
cd BridgeAble
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

Backend runs at: **http://localhost:5000**

### 3. AI Module Setup

```bash
cd ai-module
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

AI Module runs at: **http://localhost:8000**

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/bridgeable
JWT_SECRET=change_this_secret
AI_MODULE_URL=http://127.0.0.1:8000
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_AI_URL=http://localhost:8000
```

### AI Module (`ai-module/.env`)

```
PORT=8000
MODEL_PATH=./models/gesture_model.h5
DEMO_MODE=true
```

---

## 📡 API Overview

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/auth/register`            | Register new user        |
| POST   | `/api/auth/login`               | Login user               |
| GET    | `/api/auth/me`                  | Get current user         |
| GET    | `/api/meetings`                 | List user's meetings     |
| POST   | `/api/meetings`                 | Create a meeting         |
| GET    | `/api/meetings/:id`             | Get meeting details      |
| PUT    | `/api/meetings/:id`             | Update meeting           |
| DELETE | `/api/meetings/:id`             | Delete meeting           |
| POST   | `/api/meetings/join`            | Join meeting by code     |
| GET    | `/api/meetings/:id/messages`    | Get meeting messages     |
| POST   | `/api/meetings/:id/messages`    | Send message             |
| GET    | `/api/meetings/:id/transcript`  | Get meeting transcript   |
| GET    | `/api/users/profile`            | Get user profile         |
| PUT    | `/api/users/profile`            | Update profile           |
| GET    | `/api/users/accessibility`      | Get accessibility prefs  |
| PUT    | `/api/users/accessibility`      | Update accessibility     |

---

## 🤖 AI Pipeline

```
Camera Frame
  → MediaPipe Hand Detection
    → Landmark Extraction (21 hand landmarks)
      → Feature Processing
        → Gesture Classification (TensorFlow)
          → Predicted Sign + Confidence
            → Text Output → Meeting
```

**Demo Mode:** When `DEMO_MODE=true`, the AI module returns simulated predictions for demonstration purposes. This is clearly labeled in the UI.

**Supported Signs (Demo):** HELLO, YES, NO, THANK YOU, HELP, PLEASE, STOP

---

## 🔌 Socket.IO Events

| Event              | Direction        | Description                    |
|--------------------|------------------|--------------------------------|
| `join-meeting`     | Client → Server  | User joins a meeting room      |
| `leave-meeting`    | Client → Server  | User leaves meeting            |
| `user-joined`      | Server → Client  | Notify others of new user      |
| `user-left`        | Server → Client  | Notify others user left        |
| `offer`            | Client → Client  | WebRTC SDP offer               |
| `answer`           | Client → Client  | WebRTC SDP answer              |
| `ice-candidate`    | Client → Client  | WebRTC ICE candidate           |
| `chat-message`     | Bidirectional     | Real-time chat                 |
| `caption-message`  | Bidirectional     | Live caption broadcast         |
| `sign-message`     | Bidirectional     | Sign language translation      |
| `participant-status`| Bidirectional    | Mic/cam/speaking status        |

---

## 🌐 WebRTC Architecture

```
Browser A                    Server                    Browser B
   │                           │                           │
   │── join-meeting ──────────▶│                           │
   │                           │◀── join-meeting ──────────│
   │                           │                           │
   │◀── user-joined ──────────│── user-joined ───────────▶│
   │                           │                           │
   │── offer ─────────────────▶│── offer ─────────────────▶│
   │                           │                           │
   │◀── answer ───────────────│◀── answer ────────────────│
   │                           │                           │
   │── ice-candidate ────────▶│── ice-candidate ─────────▶│
   │◀── ice-candidate ────────│◀── ice-candidate ─────────│
   │                           │                           │
   │◀═══════ P2P Media Stream ═══════════════════════════▶│
```

---

## 🔮 Future Improvements

- **Real trained gesture model** with expanded sign language vocabulary
- **Recording & playback** of meetings
- **Multi-language support** for captions and TTS
- **End-to-end encryption** for media streams
- **Mobile native apps** (React Native)
- **Breakout rooms** for large meetings
- **Virtual backgrounds** for privacy
- **AI-powered meeting summaries**
- **Integration with calendar apps** (Google Calendar, Outlook)
- **Custom sign language dictionaries** per user/organization

---

## 📄 License

This project is built for academic and demonstration purposes.

---

**BridgeAble** — *Meet Without Barriers.* 🌉
