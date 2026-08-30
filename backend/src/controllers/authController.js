const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { userStore } = require('../config/fileStore');
const { generateToken } = require('../utils/helpers');
const { validationResult } = require('express-validator');

const isDbConnected = () => mongoose.connection.readyState === 1;

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered' });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password
      });

      const token = generateToken(user);

      return res.status(201).json({
        message: 'Registration successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          accessibilityPreferences: user.accessibilityPreferences
        }
      });
    }

    // Disk-backed persistent fallback
    const existing = userStore.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = userStore.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      avatar: '',
      role: 'user',
      accessibilityPreferences: {
        captionsEnabled: true,
        signLanguageEnabled: false,
        speechToTextEnabled: false,
        textToSpeechEnabled: false,
        highContrast: false,
        largeText: false,
        reduceMotion: false,
        captionFontSize: 'medium'
      }
    });

    const { password: _, ...userSafe } = newUser;
    const token = generateToken(userSafe);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: userSafe
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration: ' + error.message });
  }
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user);

      return res.json({
        message: 'Login successful',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          accessibilityPreferences: user.accessibilityPreferences
        }
      });
    }

    // Disk-backed persistent fallback
    const memoryUser = userStore.findOne({ email: normalizedEmail });
    if (!memoryUser) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, memoryUser.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { password: _, ...userWithoutPassword } = memoryUser;
    const token = generateToken(userWithoutPassword);

    return res.json({
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login: ' + error.message });
  }
};

const getMe = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user._id);
      if (user) return res.json({ user });
    } else {
      const user = userStore.findById(req.user._id);
      if (user) {
        const { password: _, ...userSafe } = user;
        return res.json({ user: userSafe });
      }
    }

    return res.json({ user: req.user });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { register, login, getMe };
