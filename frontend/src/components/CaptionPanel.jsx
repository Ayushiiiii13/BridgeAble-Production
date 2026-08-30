import React from 'react';
import { Subtitles, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CaptionPanel = ({
  captions = [],
  interimCaption = '',
  onClose
}) => {
  const { textSize, setTextSize, highContrast, toggleHighContrast } = useAuth();

  const latestCaption = captions.length > 0 ? captions[captions.length - 1] : null;

  return (
    <div 
      role="region" 
      aria-label="Live Captions"
      className={`rounded-2xl transition-all duration-200 border shadow-warm-lg p-4 ${
        highContrast
          ? 'bg-black text-white border-white ring-1 ring-yellow-400'
          : 'bg-[#1C1713]/95 text-[#FBF8F3] border-[#5A3E2B]'
      }`}
    >
      {/* Header controls */}
      <div className={`flex items-center justify-between pb-2 mb-2 border-b text-xs ${
        highContrast ? 'border-white text-yellow-400' : 'border-[#5A3E2B]/50 text-[#A67C52]'
      }`}>
        <div className="flex items-center gap-2">
          <Subtitles className="w-4 h-4" />
          <span className="font-semibold uppercase tracking-wider">Live Captions (Web Speech API)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Font Size controls (S / M / L / XL) */}
          <div 
            role="group" 
            aria-label="Accessibility text size controls"
            className="flex items-center bg-[#2F261F] text-white rounded-lg p-0.5 border border-[#5A3E2B]"
          >
            <button
              type="button"
              onClick={() => setTextSize('small')}
              aria-label="Small text size (90%)"
              aria-pressed={textSize === 'small'}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                textSize === 'small' ? 'bg-[#A67C52] text-white shadow-sm' : 'text-[#CDB494] hover:text-white'
              }`}
            >
              S
            </button>
            <button
              type="button"
              onClick={() => setTextSize('medium')}
              aria-label="Medium text size (100%)"
              aria-pressed={textSize === 'medium'}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                textSize === 'medium' ? 'bg-[#A67C52] text-white shadow-sm' : 'text-[#CDB494] hover:text-white'
              }`}
            >
              M
            </button>
            <button
              type="button"
              onClick={() => setTextSize('large')}
              aria-label="Large text size (115%)"
              aria-pressed={textSize === 'large'}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                textSize === 'large' ? 'bg-[#A67C52] text-white shadow-sm' : 'text-[#CDB494] hover:text-white'
              }`}
            >
              L
            </button>
            <button
              type="button"
              onClick={() => setTextSize('xlarge')}
              aria-label="Extra Large text size (130%)"
              aria-pressed={textSize === 'xlarge'}
              className={`px-2 py-0.5 text-[10px] font-bold rounded transition ${
                textSize === 'xlarge' ? 'bg-[#A67C52] text-white shadow-sm' : 'text-[#CDB494] hover:text-white'
              }`}
            >
              XL
            </button>
          </div>

          {/* High Contrast Toggle Button */}
          <button
            type="button"
            onClick={toggleHighContrast}
            aria-label="Toggle high contrast accessibility mode"
            aria-pressed={highContrast}
            className={`p-1.5 rounded-lg border transition ${
              highContrast
                ? 'bg-yellow-400 text-black border-yellow-400'
                : 'border-[#5A3E2B] hover:bg-[#5A3E2B]/50 text-[#CDB494]'
            }`}
            title="Toggle high contrast mode"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close captions panel"
              className="p-1.5 rounded-lg hover:bg-rose-900/40 text-rose-300 transition"
              title="Close captions"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Caption Content */}
      <div className="min-h-[55px] flex flex-col justify-end space-y-1.5">
        {latestCaption ? (
          <div className="animate-fade-in text-base sm:text-lg">
            <span className={`font-bold mr-2 ${highContrast ? 'text-yellow-300' : 'text-[#CDB494]'}`}>
              {latestCaption.speaker}:
            </span>
            <span className="leading-relaxed font-medium">
              "{latestCaption.text}"
            </span>
          </div>
        ) : (
          <p className={`text-xs italic ${highContrast ? 'text-gray-300' : 'text-[#A67C52]'}`}>
            Waiting for speech... Speak into your microphone or start Speech-to-Text.
          </p>
        )}

        {/* Interim/real-time word-by-word streaming caption */}
        {interimCaption && (
          <div className={`italic animate-pulse ${highContrast ? 'text-yellow-200' : 'text-[#EADCC8]'}`}>
            <span className="font-semibold text-amber-400 mr-2 not-italic">Speaking:</span>
            <span>"{interimCaption}"</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaptionPanel;
