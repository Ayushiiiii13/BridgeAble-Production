import React from 'react';
import { Users, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { useMeeting } from '../context/MeetingContext';
import { useAuth } from '../context/AuthContext';

const ParticipantsList = () => {
  const { participants, micEnabled, cameraEnabled } = useMeeting();
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-[#FBF8F3] border border-[#EADCC8] rounded-2xl shadow-warm overflow-hidden">
      <div className="p-3.5 border-b border-[#EADCC8] bg-[#F7F1E8] flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#5A3E2B]">
          <Users className="w-4 h-4 text-[#A67C52]" />
          <h3 className="font-semibold text-sm">Meeting Participants</h3>
        </div>
        <span className="badge-beige">
          {participants.length + 1}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {/* Local user card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EADCC8]/40 border border-[#DCC8AE]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#5A3E2B] text-white font-bold flex items-center justify-center text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'Y'}
            </div>
            <div>
              <p className="text-xs font-bold text-[#5A3E2B]">
                {user?.name || 'You'} <span className="font-normal text-[#7D7167]">(Host, You)</span>
              </p>
              <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[#5A3E2B]">
            {micEnabled ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <MicOff className="w-3.5 h-3.5 text-rose-600" />}
            {cameraEnabled ? <Video className="w-3.5 h-3.5 text-emerald-600" /> : <VideoOff className="w-3.5 h-3.5 text-rose-600" />}
          </div>
        </div>

        {/* Remote participants list */}
        {participants.map((p, idx) => (
          <div key={p.id || p.socketId || idx} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F7F1E8] border border-transparent hover:border-[#EADCC8] transition">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#7A5A42] text-white font-bold flex items-center justify-center text-xs">
                {(p.userName || p.name || 'P').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#2F261F]">
                  {p.userName || p.name || 'Participant'}
                </p>
                {p.role && (
                  <span className="text-[10px] bg-[#EADCC8] text-[#5A3E2B] px-1.5 py-0.2 rounded font-medium">
                    {p.role}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[#7D7167]">
              {p.isSpeaking && <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />}
              {p.micEnabled !== false ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <MicOff className="w-3.5 h-3.5 text-rose-500" />}
              {p.cameraEnabled !== false ? <Video className="w-3.5 h-3.5 text-emerald-600" /> : <VideoOff className="w-3.5 h-3.5 text-rose-500" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;
