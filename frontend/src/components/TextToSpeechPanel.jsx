import React, { useState } from 'react';
import { Volume2, Send, Sparkles } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

const TextToSpeechPanel = () => {
  const { speakText, sendChatMessage } = useMeeting();
  const [customText, setCustomText] = useState('');

  const quickPhrases = [
    'Could you please repeat that?',
    'I agree with this point.',
    'I have a question about the design.',
    'Thank you all for waiting.',
    'Please give me a moment to type.',
    'Let us proceed to the next item.'
  ];

  const handleSpeak = (text) => {
    if (text) {
      speakText(text);
    }
  };

  const handleSpeakAndSend = () => {
    if (customText.trim()) {
      speakText(customText);
      sendChatMessage(customText);
      setCustomText('');
    }
  };

  return (
    <div className="bg-[#FBF8F3] border border-[#EADCC8] rounded-2xl p-4 shadow-warm flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-[#EADCC8] pb-2">
        <div className="flex items-center gap-2 text-[#5A3E2B]">
          <Volume2 className="w-5 h-5 text-[#A67C52]" />
          <h3 className="font-semibold text-sm">Text to Speech (Non-Speaking)</h3>
        </div>
      </div>

      {/* Quick Phrases */}
      <div>
        <span className="text-[11px] text-[#7D7167] font-medium block mb-1.5">Quick Voice Phrases:</span>
        <div className="grid grid-cols-2 gap-1.5">
          {quickPhrases.map((phrase, i) => (
            <button
              key={i}
              onClick={() => {
                handleSpeak(phrase);
                sendChatMessage(phrase);
              }}
              className="text-left text-[11px] bg-[#F7F1E8] hover:bg-[#EADCC8] text-[#5A3E2B] border border-[#DCC8AE] p-2 rounded-xl transition line-clamp-1"
              title={`Speak: "${phrase}"`}
            >
              🔊 {phrase}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Text Input */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] text-[#7D7167] font-medium block">Custom Speech Synthesis:</span>
        <textarea
          rows={2}
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type what you want to speak aloud to the meeting..."
          className="w-full bg-white border border-[#DCC8AE] rounded-xl p-2.5 text-xs text-[#2F261F] placeholder-[#7D7167] focus:outline-none focus:border-[#5A3E2B] resize-none"
        />

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSpeak(customText)}
            disabled={!customText.trim()}
            className="btn-secondary text-xs py-2 flex-1 disabled:opacity-40"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak Locally</span>
          </button>

          <button
            onClick={handleSpeakAndSend}
            disabled={!customText.trim()}
            className="btn-primary text-xs py-2 flex-1 disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Speak & Chat</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPanel;
