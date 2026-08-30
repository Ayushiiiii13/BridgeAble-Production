import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Subtitles, 
  Hand, 
  Volume2, 
  ArrowRight, 
  Sliders, 
  CheckCircle2,
  Sparkles,
  Shield,
  AlertCircle
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Navbar from '../components/Navbar';

const PreJoinPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { 
    initLocalStream, 
    localStream, 
    micEnabled, 
    cameraEnabled, 
    toggleMic, 
    toggleCamera,
    captionsEnabled,
    setCaptionsEnabled,
    signLanguageEnabled,
    setSignLanguageEnabled,
  } = useMeeting();

  const [meetingDetails, setMeetingDetails] = useState(null);
  const [sttPref, setSttPref] = useState(true);
  const [ttsPref, setTtsPref] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const res = await apiService.getMeeting(meetingId);
        if (res?.meeting) {
          setMeetingDetails(res.meeting);
        } else {
          setMeetingDetails({
            _id: meetingId,
            meetingCode: meetingId,
            title: `Meeting (${meetingId})`
          });
        }
      } catch (e) {
        console.warn('Meeting metadata not found, using direct session:', e.message);
        setMeetingDetails({
          _id: meetingId,
          meetingCode: meetingId,
          title: `Meeting (${meetingId})`
        });
      }
    };
    if (isAuthenticated) {
      loadInfo();
      initLocalStream(true, true);
    }
  }, [meetingId, initLocalStream, isAuthenticated]);



  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const isMeetingEnded = meetingDetails?.status === 'ended';

  const handleJoin = () => {
    if (isMeetingEnded) return; // Safety guard — UI should already prevent this
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F1E8] flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center animate-fade-in">
        <div className="text-center mb-6 space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#EADCC8] text-[#5A3E2B] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-[#A67C52]" />
            Pre-Meeting Setup
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">
            {meetingDetails?.title || 'Accessibility Video Session'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D7167]">
            Meeting Code: <span className="font-mono font-bold text-[#5A3E2B]">{meetingId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Camera / Mic Preview Column */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative bg-[#2F261F] aspect-video rounded-3xl overflow-hidden shadow-warm-xl border-4 border-[#5A3E2B] flex items-center justify-center">
              {cameraEnabled && localStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#EADCC8] space-y-2">
                  <div className="w-20 h-20 rounded-full bg-[#5A3E2B] flex items-center justify-center text-3xl font-bold border-2 border-[#DCC8AE]">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
                  </div>
                  <p className="text-sm font-semibold">{user?.name || 'You'}</p>
                  <span className="text-xs text-[#CDB494]">Camera is currently off</span>
                </div>
              )}

              {/* Bottom Quick Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[#2F261F]/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-[#7A5A42]/60">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-3 rounded-xl transition ${
                    micEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                  title={micEnabled ? 'Mute Microphone' : 'Unmute Microphone'}
                >
                  {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-3 rounded-xl transition ${
                    cameraEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                  title={cameraEnabled ? 'Turn Off Camera' : 'Turn On Camera'}
                >
                  {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Accessibility Settings & Join Column */}
          <div className="lg:col-span-5 space-y-5">
            <div className="card-warm p-6 space-y-4 shadow-warm-lg">
              <h2 className="text-base font-bold text-[#5A3E2B] flex items-center gap-2 border-b border-[#EADCC8] pb-2">
                <Sliders className="w-4 h-4 text-[#A67C52]" />
                <span>Configure Accessibility</span>
              </h2>

              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/40 transition">
                  <div className="flex items-center gap-2.5">
                    <Subtitles className="w-4 h-4 text-[#5A3E2B]" />
                    <span className="text-xs font-semibold text-[#2F261F]">Live Captions</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={captionsEnabled}
                    onChange={(e) => setCaptionsEnabled(e.target.checked)}
                    className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/40 transition">
                  <div className="flex items-center gap-2.5">
                    <Hand className="w-4 h-4 text-[#5A3E2B]" />
                    <span className="text-xs font-semibold text-[#2F261F]">Sign Language AI</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={signLanguageEnabled}
                    onChange={(e) => setSignLanguageEnabled(e.target.checked)}
                    className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/40 transition">
                  <div className="flex items-center gap-2.5">
                    <Mic className="w-4 h-4 text-[#5A3E2B]" />
                    <span className="text-xs font-semibold text-[#2F261F]">Speech to Text (STT)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sttPref}
                    onChange={(e) => setSttPref(e.target.checked)}
                    className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/40 transition">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-[#5A3E2B]" />
                    <span className="text-xs font-semibold text-[#2F261F]">Text to Speech (TTS)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ttsPref}
                    onChange={(e) => setTtsPref(e.target.checked)}
                    className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                  />
                </label>
              </div>

              {/* Ended meeting warning */}
              {isMeetingEnded && (
                <div className="flex items-start gap-3 p-4 bg-gray-100 border border-gray-300 rounded-2xl text-gray-600">
                  <AlertCircle className="w-5 h-5 shrink-0 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-gray-700">This meeting has ended</p>
                    <p className="text-xs mt-0.5">
                      The scheduled duration for this session has passed. You can view the transcript below.
                    </p>
                  </div>
                </div>
              )}

              {isMeetingEnded ? (
                <div className="space-y-2 mt-2">
                  <button
                    disabled
                    className="w-full py-4 rounded-2xl text-base font-bold bg-gray-200 text-gray-400 cursor-not-allowed tracking-wide flex items-center justify-center gap-2"
                  >
                    <span>Meeting Ended</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  className="w-full btn-primary py-4 shadow-warm-lg text-base font-bold tracking-wide mt-2"
                >
                  <span>JOIN MEETING</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreJoinPage;
