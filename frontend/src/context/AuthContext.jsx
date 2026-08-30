import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('bridgeable_token'));
  const [loading, setLoading] = useState(true);

  // Global Accessibility States with persistent localStorage fallback
  const [highContrast, setHighContrastState] = useState(() => {
    const saved = localStorage.getItem('bridgeable_contrast');
    return saved !== null ? saved === 'true' : false;
  });

  const [textSize, setTextSizeState] = useState(() => {
    const saved = localStorage.getItem('bridgeable_text_size');
    return saved || 'medium';
  });

  const [reduceMotion, setReduceMotionState] = useState(() => {
    const saved = localStorage.getItem('bridgeable_reduce_motion');
    return saved !== null ? saved === 'true' : false;
  });

  // Apply visual styling directly to the root HTML document
  useEffect(() => {
    const root = document.documentElement;

    // Apply High Contrast
    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    localStorage.setItem('bridgeable_contrast', String(highContrast));

    // Apply Scale for S / M / L / XL
    const scaleMap = {
      small: '0.9',
      medium: '1',
      large: '1.15',
      xlarge: '1.3'
    };
    const scale = scaleMap[textSize] || '1';
    root.style.setProperty('--accessibility-scale', scale);
    localStorage.setItem('bridgeable_text_size', textSize);

    // Apply Reduce Motion
    if (reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    localStorage.setItem('bridgeable_reduce_motion', String(reduceMotion));
  }, [highContrast, textSize, reduceMotion]);

  // Sync user profile preferences with local accessibility states upon loading
  useEffect(() => {
    if (user?.accessibilityPreferences) {
      const prefs = user.accessibilityPreferences;
      if (typeof prefs.highContrast === 'boolean') {
        setHighContrastState(prefs.highContrast);
      }
      if (prefs.captionFontSize) {
        setTextSizeState(prefs.captionFontSize);
      } else if (prefs.largeText) {
        setTextSizeState('large');
      }
      if (typeof prefs.reduceMotion === 'boolean') {
        setReduceMotionState(prefs.reduceMotion);
      }
    }
  }, [user]);

  // Toggle helpers
  const toggleHighContrast = useCallback(() => {
    setHighContrastState((prev) => {
      const next = !prev;
      if (user?.accessibilityPreferences) {
        apiService.updateAccessibility({
          ...user.accessibilityPreferences,
          highContrast: next
        }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  const setTextSize = useCallback((size) => {
    setTextSizeState(size);
    if (user?.accessibilityPreferences) {
      apiService.updateAccessibility({
        ...user.accessibilityPreferences,
        captionFontSize: size,
        largeText: size === 'large' || size === 'xlarge'
      }).catch(() => {});
    }
  }, [user]);

  const toggleReduceMotion = useCallback(() => {
    setReduceMotionState((prev) => {
      const next = !prev;
      if (user?.accessibilityPreferences) {
        apiService.updateAccessibility({
          ...user.accessibilityPreferences,
          reduceMotion: next
        }).catch(() => {});
      }
      return next;
    });
  }, [user]);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('bridgeable_token');
      if (storedToken) {
        try {
          const res = await apiService.getMe();
          if (res?.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('bridgeable_token');
            setToken(null);
            setUser(null);
          }
        } catch (err) {
          console.warn('Authentication token expired or invalid:', err.message);
          localStorage.removeItem('bridgeable_token');
          setToken(null);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await apiService.login(credentials);
      if (res?.token) {
        localStorage.setItem('bridgeable_token', res.token);
        setToken(res.token);
      }
      if (res?.user) {
        setUser(res.user);
      }
      return { success: true, user: res.user };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed. Please check your credentials.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await apiService.register(userData);
      if (res?.token) {
        localStorage.setItem('bridgeable_token', res.token);
        setToken(res.token);
      }
      if (res?.user) {
        setUser(res.user);
      }
      return { success: true, user: res.user };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bridgeable_token');
    setToken(null);
    setUser(null);
  };

  const updateAccessibilityPreferences = async (newPrefs) => {
    try {
      if (typeof newPrefs.highContrast === 'boolean') {
        setHighContrastState(newPrefs.highContrast);
      }
      if (newPrefs.captionFontSize) {
        setTextSizeState(newPrefs.captionFontSize);
      } else if (newPrefs.largeText) {
        setTextSizeState('large');
      }
      if (typeof newPrefs.reduceMotion === 'boolean') {
        setReduceMotionState(newPrefs.reduceMotion);
      }

      const res = await apiService.updateAccessibility(newPrefs);
      setUser((prev) => (prev ? {
        ...prev,
        accessibilityPreferences: newPrefs,
      } : prev));
      return res;
    } catch (err) {
      console.error('Error updating accessibility preferences', err);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const res = await apiService.updateProfile(updates);
      if (res?.user) {
        setUser(res.user);
      }
      return res;
    } catch (err) {
      console.error('Error updating profile', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        highContrast,
        setHighContrast: setHighContrastState,
        toggleHighContrast,
        textSize,
        setTextSize,
        reduceMotion,
        toggleReduceMotion,
        login,
        register,
        logout,
        updateAccessibilityPreferences,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
