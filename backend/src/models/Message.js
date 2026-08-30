const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  senderName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['chat', 'caption', 'sign', 'system'],
    default: 'chat'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

messageSchema.index({ meeting: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);
