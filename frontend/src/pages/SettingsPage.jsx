import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Subtitles, 
  Hand, 
  Mic, 
  Volume2, 
  Eye, 
  Type, 
  Activity, 
  CheckCircle2, 
  Save 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const {
    user,
    highContrast,
    setHighContrast,
    textSize,
    setTextSize,
    reduceMotion,
    toggleReduceMotion,
    updateAccessibilityPreferences
  } = useAuth();
  
  const [prefs, setPrefs] = useState({
    captionsEnabled: true,
    signLanguageEnabled: true,
    speechToTextEnabled: true,
    textToSpeechEnabled: true,
    highContrast: highContrast,
    largeText: textSize === 'large' || textSize === 'xlarge',
    reduceMotion: reduceMotion,
    captionFontSize: textSize,
  });

  useEffect(() => {
    if (user?.accessibilityPreferences) {
      setPrefs({
        ...user.accessibilityPreferences,
        highContrast: highContrast,
        captionFontSize: textSize,
        largeText: textSize === 'large' || textSize === 'xlarge',
        reduceMotion: reduceMotion
      });
    }
  }, [user, highContrast, textSize, reduceMotion]);

  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    const nextVal = !prefs[key];
    setPrefs((prev) => ({ ...prev, [key]: nextVal }));

    // Apply immediate visual feedback
    if (key === 'highContrast') {
      setHighContrast(nextVal);
    } else if (key === 'reduceMotion') {
      toggleReduceMotion();
    } else if (key === 'largeText') {
      setTextSize(nextVal ? 'large' : 'medium');
    }
  };

  const handleFontSizeChange = (size) => {
    setPrefs((prev) => ({
      ...prev,
      captionFontSize: size,
      largeText: size === 'large' || size === 'xlarge'
    }));
    setTextSize(size);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateAccessibilityPreferences(prefs);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">
          Accessibility Preferences
        </h1>
        <p className="text-sm text-[#7D7167]">
          Customize meeting defaults, assistive tools, visual contrast, and typography
        </p>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Preferences saved and applied across BridgeAble!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Assistive Meeting Features */}
        <div className="card-warm p-6 space-y-4 shadow-warm">
          <h2 className="text-base font-bold text-[#5A3E2B] flex items-center gap-2 border-b border-[#EADCC8] pb-2">
            <Sliders className="w-4 h-4 text-[#A67C52]" />
            <span>Assistive Communication Modules</span>
          </h2>

          <div className="space-y-3">
            {[
              { key: 'captionsEnabled', label: 'Live Speech Captions', desc: 'Display real-time subtitles during video calls', icon: Subtitles },
              { key: 'signLanguageEnabled', label: 'Sign Language AI Recognition', desc: 'Activate MediaPipe gesture tracking inside meetings', icon: Hand },
              { key: 'speechToTextEnabled', label: 'Speech-to-Text Transcription', desc: 'Convert spoken words to transcribed text entries', icon: Mic },
              { key: 'textToSpeechEnabled', label: 'Text-to-Speech Engine', desc: 'Synthesize spoken audio from typed text for non-speaking users', icon: Volume2 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F1E8] border border-[#EADCC8]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2F261F]">{item.label}</p>
                      <p className="text-xs text-[#7D7167]">{item.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    aria-label={`Toggle ${item.label}`}
                    aria-pressed={prefs[item.key]}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                      prefs[item.key] ? 'bg-[#5A3E2B]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        prefs[item.key] ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Visual & Sensory Accessibility */}
        <div className="card-warm p-6 space-y-4 shadow-warm">
          <h2 className="text-base font-bold text-[#5A3E2B] flex items-center gap-2 border-b border-[#EADCC8] pb-2">
            <Eye className="w-4 h-4 text-[#A67C52]" />
            <span>Visual & Sensory Controls</span>
          </h2>

          <div className="space-y-3">
            {[
              { key: 'highContrast', label: 'High Contrast Mode', desc: 'Maximize element contrast and crisp dark text for readability', icon: Eye },
              { key: 'largeText', label: 'Larger Typography', desc: 'Increase base font size across the interface by 15%', icon: Type },
              { key: 'reduceMotion', label: 'Reduce Motion', desc: 'Minimize animations and transitions for sensitive users', icon: Activity },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="flex items-center justify-between p-3.5 rounded-xl bg-[#F7F1E8] border border-[#EADCC8]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#2F261F]">{item.label}</p>
                      <p className="text-xs text-[#7D7167]">{item.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggle(item.key)}
                    aria-label={`Toggle ${item.label}`}
                    aria-pressed={prefs[item.key]}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                      prefs[item.key] ? 'bg-[#5A3E2B]' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        prefs[item.key] ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}

            {/* Typography Scale Selection */}
            <div className="p-3.5 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-[#2F261F]">Global Typography Scale (S/M/L/XL)</p>
                <p className="text-xs text-[#7D7167]">Choose proportional font scaling across BridgeAble</p>
              </div>

              <select
                value={prefs.captionFontSize || textSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                aria-label="Global Typography Scale"
                className="bg-white border border-[#DCC8AE] rounded-xl px-3 py-1.5 text-xs text-[#2F261F] font-semibold focus:outline-none focus:border-[#5A3E2B]"
              >
                <option value="small">Small (90%)</option>
                <option value="medium">Medium (100% - Standard)</option>
                <option value="large">Large (115%)</option>
                <option value="xlarge">Extra Large (130%)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="btn-primary py-3 px-8 shadow-warm-lg text-sm font-bold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
