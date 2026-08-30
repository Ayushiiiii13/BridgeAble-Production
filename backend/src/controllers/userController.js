const mongoose = require('mongoose');
const User = require('../models/User');
const { userStore } = require('../config/fileStore');

const isDbConnected = () => mongoose.connection.readyState === 1;

const getProfile = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (user) return res.json({ user });
    }

    const user = userStore.findById(req.user._id);
    if (user) {
      const { password: _, ...userSafe } = user;
      return res.json({ user: userSafe });
    }

    return res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name.trim();
    if (avatar !== undefined) updates.avatar = avatar;

    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      );
      if (user) return res.json({ message: 'Profile updated', user });
    }

    const updated = userStore.findByIdAndUpdate(req.user._id, updates);
    if (updated) {
      const { password: _, ...userSafe } = updated;
      return res.json({ message: 'Profile updated', user: userSafe });
    }

    return res.json({ message: 'Profile updated', user: { ...req.user, ...updates } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile: ' + error.message });
  }
};

const getAccessibility = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (user) return res.json({ preferences: user.accessibilityPreferences });
    }

    const user = userStore.findById(req.user._id);
    if (user) return res.json({ preferences: user.accessibilityPreferences });

    return res.json({ preferences: req.user.accessibilityPreferences });
  } catch (error) {
    console.error('Get accessibility error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateAccessibility = async (req, res) => {
  try {
    const prefs = req.body;

    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { accessibilityPreferences: prefs },
        { new: true, runValidators: true }
      );
      if (user) return res.json({ message: 'Preferences updated', preferences: user.accessibilityPreferences });
    }

    const updated = userStore.findByIdAndUpdate(req.user._id, { accessibilityPreferences: prefs });
    if (updated) return res.json({ message: 'Preferences updated', preferences: updated.accessibilityPreferences });

    return res.json({ message: 'Preferences updated', preferences: prefs });
  } catch (error) {
    console.error('Update accessibility error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getProfile, updateProfile, getAccessibility, updateAccessibility };
