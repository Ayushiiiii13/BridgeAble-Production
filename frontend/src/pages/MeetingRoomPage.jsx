import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  Hand, 
  Users, 
  Laptop, 
  Subtitles, 
  Volume2, 
  X,
  Copy,
  CheckCircle2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

// Components
import ParticipantVideo from '../components/ParticipantVideo';
import MeetingChat from '../components/MeetingChat';
import ParticipantsList from '../components/ParticipantsList';
import SignLanguagePanel from '../components/SignLanguagePanel';
import SpeechToTextPanel from '../components/SpeechToTextPanel';
import TextToSpeechPanel from '../components/TextToSpeechPanel';
import CaptionPanel from '../components/CaptionPanel';

const MeetingRoomPage = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const {
    currentMeeting,
    localStream,
    remoteStreams,
    screenStream,
    micEnabled,
    cameraEnabled,
    isScreenSharing,
    participants,
    captions,
    interimCaption,
    latestSign,
    meetingDuration,
    initLocalStream,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    joinMeetingRoom,
    leaveMeeting
  } = useMeeting();

  const [activeSidebarTab, setActiveSidebarTab] = useState(null); // 'sign', 'chat', 'participants', 'tts', 'speech', null
  const [showCaptions, setShowCaptions] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [meetingData, setMeetingData] = useState(null);

  // Authentication protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load meeting metadata & join room
  useEffect(() => {
    let isMounted = true;
    const setupRoom = async () => {
      try {
        const stream = await initLocalStream(true, true);
        const res = await apiService.getMeeting(meetingId);
        const meetingObj = res?.meeting || {
          _id: meetingId,
          meetingCode: meetingId,
          title: 'BridgeAble Accessibility Session',
          host: user
        };

        if (isMounted) {
          setMeetingData(meetingObj);
          joinMeetingRoom(meetingObj);
        }
      } catch (err) {
        console.warn('Error loading meeting info:', err);
        const fallbackMeeting = {
          _id: meetingId,
          meetingCode: meetingId,
          title: `Meeting (${meetingId})`,
          host: user
        };
        if (isMounted) {
          setMeetingData(fallbackMeeting);
          joinMeetingRoom(fallbackMeeting);
        }
      }
    };

    if (isAuthenticated) {
      setupRoom();
    }

    return () => {
      isMounted = false;
    };
  }, [meetingId, isAuthenticated, initLocalStream, joinMeetingRoom, user]);

  const handleCopyCode = () => {
    const code = meetingData?.meetingCode || meetingId;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeave = () => {
    leaveMeeting();
    navigate('/dashboard');
  };

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Filter remote participants (excluding local user)
  const remoteParticipants = participants.filter(
    p => p.userId !== user?._id && p.userName !== user?.name
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1F1914] text-[#FBF8F3] overflow-hidden select-none">
      {/* 1. TOP STATUS BAR */}
      <header className="h-14 bg-[#2F261F] border-b border-[#5A3E2B] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Meeting Info & Code */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm sm:text-base font-bold text-[#FBF8F3] truncate max-w-[200px] sm:max-w-xs">
            {meetingData?.title || 'Accessibility Session'}
          </h1>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 bg-[#422D1F] hover:bg-[#5A3E2B] text-[#EADCC8] text-xs px-2.5 py-1 rounded-lg border border-[#7A5A42] transition font-mono"
            title="Click to copy meeting code"
          >
            <span>{meetingData?.meetingCode || meetingId}</span>
            {copiedCode ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center: Live Timer & Security Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#1F1914] px-3 py-1 rounded-full border border-[#5A3E2B] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-emerald-400 font-bold">{formatTime(meetingDuration)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#A67C52] bg-[#2F261F] px-2.5 py-1 rounded-lg border border-[#5A3E2B]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted WebRTC</span>
          </div>
        </div>

        {/* Right: Real-Time Sign Status & Active Member count */}
        <div className="flex items-center gap-2">
          {latestSign && (
            <div className="hidden md:flex items-center gap-1.5 bg-amber-950/80 border border-amber-500/50 text-amber-200 px-2.5 py-1 rounded-lg text-xs animate-pulse">
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span>Sign: <strong>{latestSign.sign}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-[#EADCC8] bg-[#422D1F] px-2.5 py-1 rounded-lg border border-[#7A5A42]">
            <Users className="w-3.5 h-3.5 text-[#CDB494]" />
            <span>{remoteParticipants.length + 1}</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN MEETING CANVAS & VIDEO GRID */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#1F1914] to-[#2B221B]">
          {/* Dynamic Video Grid Layout */}
          <div className={`flex-1 grid gap-4 items-center justify-center max-w-6xl mx-auto w-full my-auto ${
            remoteParticipants.length === 0
              ? 'grid-cols-1 max-w-3xl'
              : remoteParticipants.length === 1
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}>
            {/* Local Video Stream */}
            <ParticipantVideo
              stream={localStream}
              name={user?.name || 'You'}
              isLocal={true}
              micEnabled={micEnabled}
              cameraEnabled={cameraEnabled}
              isSpeaking={false}
              signActive={activeSidebarTab === 'sign'}
              role="You (Host)"
            />

            {/* Screen Share Tile if Active */}
            {isScreenSharing && screenStream && (
              <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-[#A67C52] aspect-video col-span-1 sm:col-span-2">
                <video
                  autoPlay
                  playsInline
                  ref={(v) => { if (v && screenStream) v.srcObject = screenStream; }}
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-2 left-2 bg-[#5A3E2B]/90 text-white text-xs px-2.5 py-1 rounded-md">
                  Your Shared Screen
                </div>
              </div>
            )}

            {/* Real Remote Participants */}
            {remoteParticipants.map((peer) => (
              <ParticipantVideo
                key={peer.socketId || peer.userId}
                stream={remoteStreams[peer.socketId]}
                name={peer.userName || peer.name || 'Participant'}
                micEnabled={peer.micEnabled !== false}
                cameraEnabled={peer.cameraEnabled !== false}
                isSpeaking={peer.isSpeaking || false}
                role="Participant"
              />
            ))}
          </div>

          {/* Waiting banner when alone in room */}
          {remoteParticipants.length === 0 && (
            <div className="text-center py-2 text-xs text-[#A67C52] flex items-center justify-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>You are the only one here. Share the code <strong>{meetingData?.meetingCode || meetingId}</strong> to invite participants.</span>
            </div>
          )}

          {/* Floating Live Captions Overlay */}
          {showCaptions && (
            <div className="w-full max-w-4xl mx-auto mt-2 z-10 animate-slide-up">
              <CaptionPanel
                captions={captions}
                interimCaption={interimCaption}
                onClose={() => setShowCaptions(false)}
              />
            </div>
          )}
        </div>

        {/* 3. RIGHT ACCESSIBILITY & COLLABORATION SIDEBAR */}
        {activeSidebarTab && (
          <aside className="w-80 md:w-96 bg-[#FBF8F3] text-[#2F261F] border-l border-[#5A3E2B] flex flex-col h-full z-20 shrink-0 shadow-2xl animate-fade-in">
            {/* Sidebar Tabs Switcher */}
            <div className="flex items-center justify-between bg-[#F7F1E8] border-b border-[#EADCC8] p-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setActiveSidebarTab('sign')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeSidebarTab === 'sign'
                      ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                      : 'text-[#7D7167] hover:bg-[#EADCC8]'
                  }`}
                  title="Sign Language AI"
                >
                  <Hand className="w-3.5 h-3.5" />
                  <span>Sign AI</span>
                </button>

                <button
                  onClick={() => setActiveSidebarTab('chat')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeSidebarTab === 'chat'
                      ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                      : 'text-[#7D7167] hover:bg-[#EADCC8]'
                  }`}
                  title="Chat"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                <button
                  onClick={() => setActiveSidebarTab('participants')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeSidebarTab === 'participants'
                      ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                      : 'text-[#7D7167] hover:bg-[#EADCC8]'
                  }`}
                  title="Participants"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Members</span>
                </button>

                <button
                  onClick={() => setActiveSidebarTab('tts')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeSidebarTab === 'tts'
                      ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                      : 'text-[#7D7167] hover:bg-[#EADCC8]'
                  }`}
                  title="Text to Speech"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>TTS</span>
                </button>

                <button
                  onClick={() => setActiveSidebarTab('speech')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    activeSidebarTab === 'speech'
                      ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                      : 'text-[#7D7167] hover:bg-[#EADCC8]'
                  }`}
                  title="Speech to Text"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>STT</span>
                </button>
              </div>

              <button
                onClick={() => setActiveSidebarTab(null)}
                className="p-1 rounded-lg hover:bg-[#EADCC8] text-[#7D7167] transition"
                title="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sidebar Tab Content */}
            <div className="flex-1 overflow-y-auto p-3">
              {activeSidebarTab === 'sign' && <SignLanguagePanel />}
              {activeSidebarTab === 'chat' && <MeetingChat />}
              {activeSidebarTab === 'participants' && <ParticipantsList />}
              {activeSidebarTab === 'tts' && <TextToSpeechPanel />}
              {activeSidebarTab === 'speech' && <SpeechToTextPanel />}
            </div>
          </aside>
        )}
      </div>

      {/* 4. BOTTOM ACCESSIBLE MEETING CONTROLS */}
      <footer className="h-20 bg-[#2F261F] border-t border-[#5A3E2B] px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Mic & Video Toggles */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMic}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition shadow-warm-sm ${
              micEnabled
                ? 'bg-[#5A3E2B] hover:bg-[#422D1F] text-white'
                : 'bg-rose-700 hover:bg-rose-800 text-white ring-2 ring-rose-500/40'
            }`}
            title={micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          >
            {micEnabled ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{micEnabled ? 'Mute' : 'Unmuted'}</span>
          </button>

          <button
            onClick={toggleCamera}
            className={`px-4 py-2.5 rounded-2xl font-semibold text-xs flex items-center gap-2 transition shadow-warm-sm ${
              cameraEnabled
                ? 'bg-[#5A3E2B] hover:bg-[#422D1F] text-white'
                : 'bg-rose-700 hover:bg-rose-800 text-white ring-2 ring-rose-500/40'
            }`}
            title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraEnabled ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{cameraEnabled ? 'Stop Video' : 'Start Video'}</span>
          </button>
        </div>

        {/* Center: Assistive & Collaboration Toggles */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1F1914] p-1.5 rounded-2xl border border-[#5A3E2B]">
          {/* Screen Share */}
          <button
            onClick={toggleScreenShare}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              isScreenSharing
                ? 'bg-[#A67C52] text-white'
                : 'text-[#EADCC8] hover:bg-[#5A3E2B]'
            }`}
            title="Screen Share"
          >
            <Laptop className="w-4 h-4" />
            <span className="hidden md:inline">Share</span>
          </button>

          {/* Captions Overlay Toggle */}
          <button
            onClick={() => setShowCaptions(!showCaptions)}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              showCaptions
                ? 'bg-amber-600 text-white'
                : 'text-[#EADCC8] hover:bg-[#5A3E2B]'
            }`}
            title="Toggle Live Captions"
          >
            <Subtitles className="w-4 h-4" />
            <span className="hidden md:inline">Captions</span>
          </button>

          {/* Sign Language AI Assistant */}
          <button
            onClick={() => setActiveSidebarTab(activeSidebarTab === 'sign' ? null : 'sign')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSidebarTab === 'sign'
                ? 'bg-amber-700 text-white'
                : 'text-[#EADCC8] hover:bg-[#5A3E2B]'
            }`}
            title="Sign Language AI"
          >
            <Hand className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">Sign AI</span>
          </button>

          {/* Meeting Chat */}
          <button
            onClick={() => setActiveSidebarTab(activeSidebarTab === 'chat' ? null : 'chat')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSidebarTab === 'chat'
                ? 'bg-[#5A3E2B] text-white'
                : 'text-[#EADCC8] hover:bg-[#5A3E2B]'
            }`}
            title="Meeting Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden md:inline">Chat</span>
          </button>

          {/* Participants */}
          <button
            onClick={() => setActiveSidebarTab(activeSidebarTab === 'participants' ? null : 'participants')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSidebarTab === 'participants'
                ? 'bg-[#5A3E2B] text-white'
                : 'text-[#EADCC8] hover:bg-[#5A3E2B]'
            }`}
            title="Participants List"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">People</span>
          </button>

          {/* Text-To-Speech (Non-Speaking) */}
          <button
            onClick={() => setActiveSidebarTab(activeSidebarTab === 'tts' ? null : 'tts')}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              activeSidebarTab === 'tts'
                ? 'bg-[#5A3E2B] text-white'
                : 'text-[#EADCC8] hover:bg-[#5A3E2B]'
            }`}
            title="Text to Speech Voice"
          >
            <Volume2 className="w-4 h-4" />
            <span className="hidden md:inline">Voice</span>
          </button>
        </div>

        {/* Right: Leave Meeting Button */}
        <div>
          <button
            onClick={handleLeave}
            className="bg-rose-700 hover:bg-rose-800 text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-warm transition"
            title="Leave Meeting"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default MeetingRoomPage;
