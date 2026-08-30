import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Hand, Volume2, Send, Play, Square, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';
import { useMeeting } from '../context/MeetingContext';

const SignLanguagePanel = () => {
  const { speakText, sendSignMessage, localStream } = useMeeting();
  
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [detectedSign, setDetectedSign] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [translatedText, setTranslatedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [aiError, setAiError] = useState(null);

  const videoPreviewRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionIntervalRef = useRef(null);
  const isProcessingRef = useRef(false);

  // Attach local stream to preview box
  useEffect(() => {
    if (videoPreviewRef.current && localStream) {
      videoPreviewRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Clean up recognition interval on unmount
  useEffect(() => {
    return () => {
      if (recognitionIntervalRef.current) {
        clearInterval(recognitionIntervalRef.current);
      }
    };
  }, []);

  // Frame capture and prediction routine
  const captureAndPredict = useCallback(async () => {
    if (!videoPreviewRef.current || !canvasRef.current || isProcessingRef.current) return;

    const video = videoPreviewRef.current;
    if (video.readyState < 2 || video.videoWidth === 0) return;

    try {
      isProcessingRef.current = true;
      setIsProcessing(true);

      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      const base64Data = dataUrl.split(',')[1];
      const result = await apiService.predictSignGesture(base64Data);

      if (!result) {
        setDetectedSign('AI unavailable');
        setConfidence(0);
        setTranslatedText('');
        return;
      }

      if (result.status === 'ai_unavailable') {
        setAiError('Sign recognition service unavailable');
        setDetectedSign('AI unavailable');
        setConfidence(0);
        setTranslatedText('');
        return;
      } else {
        setAiError(null);
      }

      // 1. Strict No Hand Detected
      if (!result.hand_detected || result.status === 'no_hand_detected') {
        setDetectedSign('No hand detected');
        setConfidence(0);
        setTranslatedText('');
        return;
      }

      // 2. Recognized Sign
      if (result.sign && result.status === 'success') {
        setDetectedSign(result.sign);
        setConfidence(Math.round(Number(result.confidence || 0) * 100));
        setTranslatedText(result.text || result.sign);
        return;
      }

      // 3. Hand present but gesture is ambiguous / low confidence
      setDetectedSign('Unrecognized gesture');
      setConfidence(Math.round(Number(result.confidence || 0) * 100));
      setTranslatedText('');

    } catch (err) {
      console.warn('Sign recognition frame capture issue:', err.message);
      setDetectedSign('AI unavailable');
      setConfidence(0);
      setTranslatedText('');
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  }, []);

  const startRecognition = () => {
    setIsRecognizing(true);
    setDetectedSign('Initializing camera frame...');
    // Initial run
    captureAndPredict();
    // Continuous recognition cycle (every 1.8 seconds)
    recognitionIntervalRef.current = setInterval(() => {
      captureAndPredict();
    }, 1800);
  };

  const stopRecognition = () => {
    setIsRecognizing(false);
    if (recognitionIntervalRef.current) {
      clearInterval(recognitionIntervalRef.current);
      recognitionIntervalRef.current = null;
    }
    setDetectedSign(null);
    setConfidence(0);
    setTranslatedText('');
  };

  const handleSpeak = () => {
    if (translatedText) {
      speakText(translatedText);
    }
  };

  const handleSendToMeeting = () => {
    if (
      detectedSign &&
      translatedText &&
      detectedSign !== 'No hand detected' &&
      detectedSign !== 'Unrecognized gesture' &&
      detectedSign !== 'AI unavailable'
    ) {
      sendSignMessage(detectedSign, translatedText, confidence / 100);
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 2000);
    }
  };

  const isSignValid =
    detectedSign &&
    translatedText &&
    detectedSign !== 'No hand detected' &&
    detectedSign !== 'Unrecognized gesture' &&
    detectedSign !== 'AI unavailable';

  return (
    <div className="bg-[#FBF8F3] border border-[#EADCC8] rounded-2xl p-4 shadow-warm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EADCC8] pb-2">
        <div className="flex items-center gap-2 text-[#5A3E2B]">
          <Hand className="w-5 h-5 text-[#A67C52]" />
          <h3 className="font-semibold text-sm">Sign Language AI Assistant</h3>
        </div>

        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
          isRecognizing ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
        }`}>
          {isRecognizing ? 'Recognizing' : 'Inactive'}
        </span>
      </div>

      {aiError && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{aiError}</span>
        </div>
      )}

      {/* Camera mini preview & Landmark canvas */}
      <div className="relative bg-[#2F261F] rounded-xl overflow-hidden aspect-video border border-[#DCC8AE] flex items-center justify-center">
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Hand Landmark overlay indicator */}
        {isRecognizing && (
          <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-[#A67C52]/60 rounded-xl m-2 flex items-center justify-center">
            <span className="bg-[#2F261F]/80 backdrop-blur-md text-[#EADCC8] text-[10px] px-2 py-1 rounded-md">
              {isProcessing ? 'Analyzing Hand Gestures...' : 'Tracking Hand Gestures'}
            </span>
          </div>
        )}

        {/* Start/Stop Button Overlay */}
        <div className="absolute bottom-2 right-2">
          {!isRecognizing ? (
            <button
              onClick={startRecognition}
              className="bg-[#5A3E2B] hover:bg-[#422D1F] text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition font-medium"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Start Recognition</span>
            </button>
          ) : (
            <button
              onClick={stopRecognition}
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow transition font-medium"
            >
              <Square className="w-3.5 h-3.5" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>

      {/* Recognition Results */}
      <div className="bg-[#F7F1E8] border border-[#EADCC8] rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#7D7167] font-medium">Detected Sign:</span>
          <span className={`font-bold px-2 py-0.5 rounded text-sm tracking-wide ${
            isSignValid 
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
              : 'bg-[#EADCC8] text-[#5A3E2B]'
          }`}>
            {detectedSign || (isRecognizing ? 'Awaiting gesture...' : 'Start to recognize')}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#7D7167] font-medium">Confidence:</span>
          <div className="flex items-center gap-2">
            <div className="w-20 bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isSignValid ? 'bg-emerald-600' : 'bg-[#5A3E2B]'
                }`}
                style={{ width: `${confidence}%` }}
              ></div>
            </div>
            <span className="font-semibold text-[#5A3E2B]">{confidence}%</span>
          </div>
        </div>

        <div className="pt-1 border-t border-[#EADCC8]">
          <span className="text-[11px] text-[#7D7167] block mb-1">Translated Text:</span>
          <p className="text-sm font-semibold text-[#2F261F] min-h-[22px]">
            {translatedText ? `"${translatedText}"` : '—'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handleSpeak}
          disabled={!isSignValid}
          className="btn-secondary text-xs py-2 disabled:opacity-40"
          title="Speak translated text aloud"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Speak (TTS)</span>
        </button>

        <button
          onClick={handleSendToMeeting}
          disabled={!isSignValid}
          className="btn-primary text-xs py-2 disabled:opacity-40"
        >
          {sentSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Sent!</span>
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Send to Room</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SignLanguagePanel;
