const mongoose = require('mongoose');
const Message = require('../models/Message');
const { messageStore } = require('../config/fileStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getMessages = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected()) {
      const messages = await Message.find({ meeting: id })
        .sort({ timestamp: 1 })
        .limit(500);

      return res.json({ messages });
    }

    const messages = messageStore.find({ meeting: id });
    return res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error fetching messages: ' + error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, type } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    if (isDbConnected()) {
      const msg = await Message.create({
        meeting: id,
        sender: req.user._id,
        senderName: req.user.name,
        message: message.trim(),
        type: type || 'chat'
      });

      return res.status(201).json({ message: msg });
    }

    const msg = messageStore.create({
      meeting: id,
      sender: req.user._id,
      senderName: req.user.name,
      message: message.trim(),
      type: type || 'chat',
      timestamp: new Date().toISOString()
    });

    return res.status(201).json({ message: msg });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error sending message: ' + error.message });
  }
};

module.exports = { getMessages, sendMessage };
