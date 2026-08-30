const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Meeting title is required'],
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  meetingCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    joinedAt: { type: Date, default: Date.now },
    leftAt: Date
  }],
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number,
    default: 60,
    min: 5,
    max: 480
  },
  actualDuration: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'ended'],
    default: 'scheduled'
  },
  settings: {
    chatEnabled: { type: Boolean, default: true },
    screenShareEnabled: { type: Boolean, default: true },
    captionsEnabled: { type: Boolean, default: true },
    signLanguageEnabled: { type: Boolean, default: true },
    recordingEnabled: { type: Boolean, default: false }
  },
  endedAt: Date
}, {
  timestamps: true
});

meetingSchema.index({ host: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ scheduledAt: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
