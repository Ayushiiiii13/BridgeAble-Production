const mongoose = require('mongoose');

const transcriptEntrySchema = new mongoose.Schema({
  speaker: {
    type: String,
    required: true
  },
  speakerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['speech', 'sign', 'chat'],
    required: true
  },
  text: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: true });

const transcriptSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
    unique: true
  },
  entries: [transcriptEntrySchema]
}, {
  timestamps: true
});

transcriptSchema.index({ meeting: 1 });

module.exports = mongoose.model('Transcript', transcriptSchema);
