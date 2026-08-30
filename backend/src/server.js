require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const connectDB = require('./config/database');
const setupSocketHandlers = require('./sockets/meetingSocket');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');
const userRoutes = require('./routes/users');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BridgeAble Backend',
    timestamp: new Date().toISOString(),
    features: ['WebRTC Signaling', 'Real-time Chat', 'Live Captions Broadcast', 'Sign Language Messages']
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);

// Error handler
app.use(errorHandler);

// Setup Socket.IO
setupSocketHandlers(io);

// Start server
server.listen(PORT, '0.0.0.0', () => {
  console.log(`BridgeAble Backend Server running on port ${PORT}`);
  connectDB();
});
