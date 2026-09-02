import axios from 'axios';

/**
 * Normalizes and formats the API base URL to ensure the `/api` route prefix is always present exactly once.
 * - If VITE_API_URL is provided, trailing slashes are stripped and '/api' is appended if not already present.
 * - In production mode, defaults to 'https://bridgeable-production.onrender.com/api'.
 * - In development mode, defaults to 'http://localhost:5000/api'.
 */
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    const cleaned = envUrl.trim().replace(/\/+$/, '');
    return cleaned.endsWith('/api') ? cleaned : `${cleaned}/api`;
  }
  return import.meta.env.PROD
    ? 'https://bridgeable-production.onrender.com/api'
    : 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();
const AI_BASE_URL = import.meta.env.VITE_AI_API_URL || import.meta.env.VITE_AI_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 12000,
});

// Guard against duplicate /api prefixes and attach token to requests
api.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('http://') && !config.url.startsWith('https://')) {
    // Strip leading /api or api to prevent duplicate /api when baseURL already ends with /api
    config.url = config.url.replace(/^\/?api(\/|$)/, '/');
  }

  const token = localStorage.getItem('bridgeable_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export const apiService = {
  // Auth
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Meetings
  async getMeetings() {
    const res = await api.get('/meetings');
    return res.data;
  },

  async createMeeting(meetingData) {
    const res = await api.post('/meetings', meetingData);
    return res.data;
  },

  async getMeeting(idOrCode) {
    const res = await api.get(`/meetings/${idOrCode}`);
    return res.data;
  },

  async joinMeeting(code) {
    const res = await api.post('/meetings/join', { meetingCode: code });
    return res.data;
  },

  async updateMeeting(id, updates) {
    const res = await api.put(`/meetings/${id}`, updates);
    return res.data;
  },

  async deleteMeeting(id) {
    const res = await api.delete(`/meetings/${id}`);
    return res.data;
  },

  async getTranscript(meetingId) {
    const res = await api.get(`/meetings/${meetingId}/transcript`);
    return res.data;
  },

  // User Profile & Accessibility Preferences
  async getProfile() {
    const res = await api.get('/users/profile');
    return res.data;
  },

  async updateProfile(updates) {
    const res = await api.put('/users/profile', updates);
    return res.data;
  },

  async getAccessibility() {
    const res = await api.get('/users/accessibility');
    return res.data;
  },

  async updateAccessibility(preferences) {
    const res = await api.put('/users/accessibility', preferences);
    return res.data;
  },

  // Real-Time AI Sign Recognition Module
  async predictSignGesture(imageDataBase64) {
    try {
      const res = await axios.post(
        `${AI_BASE_URL}/predict-sign`,
        { image: imageDataBase64 },
        { timeout: 6000, headers: { 'Content-Type': 'application/json' } }
      );
      const payload = res.data || {};

      // Strict No-Hand Detection
      if (!payload.hand_detected) {
        return {
          status: 'no_hand_detected',
          hand_detected: false,
          sign: null,
          confidence: 0,
          text: '',
          demo_mode: false
        };
      }

      // Valid recognized sign with high confidence
      if (payload.sign) {
        return {
          status: 'success',
          hand_detected: true,
          sign: payload.sign,
          confidence: Number(payload.confidence || 0),
          text: payload.text || payload.sign,
          demo_mode: false
        };
      }

      // Hand detected but ambiguous/unrecognized gesture
      return {
        status: 'unrecognized_gesture',
        hand_detected: true,
        sign: null,
        confidence: Number(payload.confidence || 0),
        text: '',
        demo_mode: false
      };
    } catch (err) {
      console.warn('AI sign recognition request error:', err.message);
      return {
        status: 'ai_unavailable',
        hand_detected: false,
        sign: null,
        confidence: 0,
        text: '',
        demo_mode: false
      };
    }
  }
};

export default api;
