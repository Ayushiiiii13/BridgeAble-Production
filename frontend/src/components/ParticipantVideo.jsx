import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, Video as VideoIcon, VideoOff, Volume2, Hand } from 'lucide-react';

const ParticipantVideo = ({
  stream,
  name = 'Participant',
  isLocal = false,
  micEnabled = true,
  cameraEnabled = true,
  isSpeaking = false,
  signActive = false,
  role = ''
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative bg-[#2F261F] rounded-2xl overflow-hidden shadow-warm-lg flex flex-col justify-center items-center aspect-video border-2 transition-all duration-200 ${
      isSpeaking ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-[#5A3E2B]/40'
    }`}>
      {/* Video Element or Avatar Fallback */}
      {cameraEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Mute local video to prevent echo
          className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#422D1F] to-[#2F261F] text-[#FBF8F3]">
          <div className="w-20 h-20 rounded-full bg-[#7A5A42] text-2xl font-bold flex items-center justify-center border-2 border-[#DCC8AE] shadow-inner">
            {name.charAt(0).toUpperCase()}
          </div>
          <p className="mt-3 text-sm font-medium text-[#EADCC8]">{name}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-[#CDB494]">
            <VideoOff className="w-3.5 h-3.5" />
            <span>Camera Off</span>
          </div>
        </div>
      )}

      {/* Top Left Indicators */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        {role && (
          <span className="bg-[#5A3E2B]/80 backdrop-blur-md text-[#FBF8F3] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border border-[#DCC8AE]/30">
            {role}
          </span>
        )}
        {signActive && (
          <span className="bg-amber-700/90 backdrop-blur-md text-white text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-400/40 animate-pulse">
            <Hand className="w-3 h-3" />
            <span>Signing</span>
          </span>
        )}
      </div>

      {/* Top Right Speaking Wave */}
      {isSpeaking && (
        <div className="absolute top-3 right-3 bg-emerald-700/90 backdrop-blur-md text-white text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-400/40">
          <Volume2 className="w-3.5 h-3.5 animate-bounce" />
          <span>Speaking</span>
        </div>
      )}

      {/* Bottom Overlay Info Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-[#2F261F]/80 backdrop-blur-md text-[#FBF8F3] px-3 py-1.5 rounded-xl border border-[#7A5A42]/50 text-xs font-medium flex items-center gap-2">
          <span>{name} {isLocal && '(You)'}</span>
        </div>

        <div className="bg-[#2F261F]/80 backdrop-blur-md px-2 py-1.5 rounded-xl border border-[#7A5A42]/50 flex items-center gap-2">
          {micEnabled ? (
            <Mic className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <MicOff className="w-3.5 h-3.5 text-rose-400" />
          )}

          {cameraEnabled ? (
            <VideoIcon className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <VideoOff className="w-3.5 h-3.5 text-rose-400" />
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantVideo;
