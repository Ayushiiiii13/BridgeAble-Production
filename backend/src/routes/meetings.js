const express = require('express');
const auth = require('../middleware/auth');
const {
  createMeeting,
  getMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  joinMeeting,
  getTranscript
} = require('../controllers/meetingController');
const { getMessages, sendMessage } = require('../controllers/messageController');

const router = express.Router();

router.post('/', auth, createMeeting);
router.get('/', auth, getMeetings);
router.post('/join', auth, joinMeeting);
router.get('/:id', auth, getMeeting);
router.put('/:id', auth, updateMeeting);
router.delete('/:id', auth, deleteMeeting);
router.get('/:id/messages', auth, getMessages);
router.post('/:id/messages', auth, sendMessage);
router.get('/:id/transcript', auth, getTranscript);

module.exports = router;
