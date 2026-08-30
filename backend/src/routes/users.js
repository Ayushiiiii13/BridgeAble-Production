const express = require('express');
const auth = require('../middleware/auth');
const {
  getProfile,
  updateProfile,
  getAccessibility,
  updateAccessibility
} = require('../controllers/userController');

const router = express.Router();

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/accessibility', auth, getAccessibility);
router.put('/accessibility', auth, updateAccessibility);

module.exports = router;
