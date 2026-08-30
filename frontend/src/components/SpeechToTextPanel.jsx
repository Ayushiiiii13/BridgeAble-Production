import React, { useState } from 'react';
import { Mic, MicOff, Copy, Trash2, CheckCircle2, AlertCircle, Globe } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';

const SpeechToTextPanel = () => {
  const {
    user,
    captions,
    setCaptions,
    interimCaption,
    sttActive,
    sttError,
    speechSupported,
    speechLang,
    setSpeechLang,
    startSpeechRecognition,
    stopSpeechRecognition
  } = useMeeting();

  const [copied, setCopied] = useState(false);

  const handleToggle = () => {
    if (sttActive) {
      stopSpeechRecognition();
    } else {
      startSpeechRecognition();
    }
  };

  const handleCopy = () => {
    const fullText = captions.map(c => `${c.speaker}: ${c.text}`).join('\n');
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setCaptions([]);
  };

  return (
    <div className="bg-[#FBF8F3] border border-[#EADCC8] rounded-2xl p-4 shadow-warm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EADCC8] pb-2">
        <div className="flex items-center gap-2 text-[#5A3E2B]">
          <Mic className="w-5 h-5 text-[#A67C52]" />
          <h3 className="font-semibold text-sm">Speech to Text</h3>
        </div>

        <div className="flex items-center gap-2">
          {sttActive && (
            <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              LIVE
            </span>
          )}
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
            sttActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
          }`}>
            {sttActive ? 'Listening...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center justify-between bg-[#F7F1E8] border border-[#EADCC8] rounded-xl px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#5A3E2B] font-medium">
          <Globe className="w-3.5 h-3.5 text-[#A67C52]" />
          <span>Speech Language:</span>
        </div>
        <select
          value={speechLang}
          onChange={(e) => setSpeechLang(e.target.value)}
          disabled={sttActive}
          aria-label="Speech Recognition Language"
          className="bg-white border border-[#DCC8AE] rounded-lg px-2 py-1 text-xs text-[#2F261F] font-semibold focus:outline-none focus:border-[#5A3E2B] disabled:opacity-60"
        >
          <option value="en-IN">English (India - en-IN)</option>
          <option value="en-US">English (US - en-US)</option>
          <option value="en-GB">English (UK - en-GB)</option>
          <option value="hi-IN">Hindi (India - hi-IN)</option>
        </select>
      </div>

      {/* Not supported warning */}
      {!speechSupported && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p>Speech recognition requires Chrome, Edge, or Safari. Firefox is not supported.</p>
        </div>
      )}

      {/* Permission / error message */}
      {sttError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <p>{sttError}</p>
        </div>
      )}

      {/* Start/Stop button */}
      <button
        type="button"
        onClick={handleToggle}
        disabled={!speechSupported}
        aria-label={sttActive ? 'Stop speech recognition' : 'Start speech recognition'}
        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow ${
          sttActive
            ? 'bg-rose-600 hover:bg-rose-700 text-white'
            : 'bg-[#5A3E2B] hover:bg-[#422D1F] text-white'
        } disabled:opacity-40`}
      >
        {sttActive
          ? <><MicOff className="w-4 h-4" /> Stop Listening</>
          : <><Mic className="w-4 h-4" /> Start Listening</>
        }
      </button>

      {/* Live interim caption */}
      {interimCaption && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-800 italic animate-pulse">
          <span className="font-bold not-italic">Speaking: </span>"{interimCaption}"
        </div>
      )}

      {/* Transcription log */}
      <div className="bg-[#F7F1E8] border border-[#EADCC8] rounded-xl p-3 min-h-[120px] max-h-48 overflow-y-auto text-xs space-y-2 font-mono">
        {captions.length > 0 ? (
          [...captions].reverse().map((cap, i) => (
            <div key={cap.id || i} className="flex flex-col border-b border-[#EADCC8]/50 pb-1.5 last:border-0">
              <span className="text-[#7D7167] text-[10px]">{cap.timestamp}</span>
              <span className="text-[#2F261F]">
                <span className="font-bold text-[#5A3E2B]">{cap.speaker}: </span>
                {cap.text}
              </span>
            </div>
          ))
        ) : (
          <p className="text-[#7D7167] italic font-sans text-center mt-6">
            {sttActive
              ? 'Listening... Speak now and your speech will be transcribed.'
              : 'Press "Start Listening" to begin real-time speech transcription.'}
          </p>
        )}
      </div>

      {/* Actions: Copy / Clear */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleCopy}
          disabled={captions.length === 0}
          aria-label="Copy full transcript to clipboard"
          className="flex-1 border border-[#DCC8AE] bg-white hover:bg-[#EADCC8] text-[#5A3E2B] text-xs py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
          title="Copy full transcript"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>

        <button
          type="button"
          onClick={handleClear}
          disabled={captions.length === 0}
          aria-label="Clear all captions and transcript"
          className="flex-1 border border-[#DCC8AE] bg-white hover:bg-rose-50 text-rose-600 text-xs py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-40"
          title="Clear transcript"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>
    </div>
  );
};

export default SpeechToTextPanel;
