import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, ArrowRight, AlertCircle } from 'lucide-react';
import { apiService } from '../services/api';

const JoinMeetingPage = () => {
  const [meetingInput, setMeetingInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');

    let code = meetingInput.trim();
    // Handle link format if user pasted a full URL
    if (code.includes('/meeting/')) {
      const parts = code.split('/meeting/');
      code = parts[1].split('/')[0];
    }

    if (!code) {
      setError('Please enter a valid meeting code or link');
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.joinMeeting(code);
      setLoading(false);
      if (res?.meeting) {
        navigate(`/meeting/${res.meeting.meetingCode || res.meeting._id}/prejoin`);
      } else {
        navigate(`/meeting/${code}/prejoin`);
      }
    } catch (err) {
      setLoading(false);
      navigate(`/meeting/${code}/prejoin`);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6 pt-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#5A3E2B] text-white flex items-center justify-center mx-auto shadow-warm-sm">
          <Video className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">Join a Meeting</h1>
        <p className="text-sm text-[#7D7167]">Enter the meeting code or invitation link to connect</p>
      </div>

      <div className="card-warm p-6 sm:p-8 shadow-warm-xl border-2 border-[#EADCC8]">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#5A3E2B] mb-1.5 uppercase tracking-wider">
              Meeting Code or Link
            </label>
            <input
              type="text"
              required
              value={meetingInput}
              onChange={(e) => setMeetingInput(e.target.value)}
              placeholder="e.g. BRG-82K4-XP"
              className="w-full bg-white border border-[#DCC8AE] rounded-xl p-3 text-sm text-[#2F261F] uppercase font-mono tracking-wider focus:outline-none focus:border-[#5A3E2B]"
            />
            <p className="text-[11px] text-[#7D7167] mt-1.5">Format: BRG-XXXX-XX or direct meeting link</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 shadow-warm text-sm font-semibold"
          >
            {loading ? 'Validating Room...' : 'Proceed to Pre-Join'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};


export default JoinMeetingPage;
