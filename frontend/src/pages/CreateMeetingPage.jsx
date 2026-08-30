import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Calendar, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Subtitles, 
  Hand, 
  MessageSquare, 
  Laptop, 
  Disc, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { apiService } from '../services/api';

const CreateMeetingPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '11:00',
    duration: 45,
    allowChat: true,
    allowScreenShare: true,
    captionsEnabled: true,
    signLanguageEnabled: true,
    recordingEnabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [createdMeeting, setCreatedMeeting] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const scheduledDate = new Date(`${formData.date}T${formData.time}:00`);

    const payload = {
      title: formData.title,
      description: formData.description,
      scheduledAt: scheduledDate.toISOString(),
      duration: formData.duration,
      settings: {
        chatEnabled: formData.allowChat,
        screenShareEnabled: formData.allowScreenShare,
        captionsEnabled: formData.captionsEnabled,
        signLanguageEnabled: formData.signLanguageEnabled,
        recordingEnabled: formData.recordingEnabled,
      }
    };

    const res = await apiService.createMeeting(payload);
    setLoading(false);

    if (res?.meeting) {
      setCreatedMeeting(res.meeting);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">Schedule a Meeting</h1>
        <p className="text-sm text-[#7D7167]">Create an accessible video conference room with customizable features</p>
      </div>

      {createdMeeting ? (
        <div className="card-warm p-8 text-center space-y-6 border-2 border-emerald-500/40 animate-slide-up">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#5A3E2B]">Meeting Ready!</h2>
            <p className="text-sm text-[#7D7167]">Share this unique meeting code or link with participants:</p>
          </div>

          <div className="bg-[#F7F1E8] border-2 border-dashed border-[#DCC8AE] p-4 rounded-2xl">
            <span className="text-xs text-[#7D7167] font-semibold block mb-1">MEETING CODE</span>
            <span className="font-mono text-3xl font-extrabold text-[#5A3E2B] tracking-wider">
              {createdMeeting.meetingCode}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate(`/meeting/${createdMeeting.meetingCode}/prejoin`)}
              className="w-full sm:w-auto btn-primary py-3 px-6 shadow-warm"
            >
              <span>Enter Pre-Join Room</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/meeting/${createdMeeting.meetingCode}/prejoin`
                );
                alert('Meeting join link copied to clipboard!');
              }}
              className="w-full sm:w-auto btn-secondary py-3 px-6"
            >
              <span>Copy Link</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card-warm p-6 sm:p-8 space-y-6 shadow-warm-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#5A3E2B] mb-1.5 uppercase tracking-wider">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Weekly Product Accessibility Sync"
                className="w-full bg-white border border-[#DCC8AE] rounded-xl p-3 text-sm text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5A3E2B] mb-1.5 uppercase tracking-wider">
                Description / Agenda
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key discussion topics, accessibility requirements, and expectations..."
                className="w-full bg-white border border-[#DCC8AE] rounded-xl p-3 text-sm text-[#2F261F] focus:outline-none focus:border-[#5A3E2B] resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#5A3E2B] mb-1.5 uppercase tracking-wider">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-white border border-[#DCC8AE] rounded-xl p-2.5 text-sm text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3E2B] mb-1.5 uppercase tracking-wider">
                  Time
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-white border border-[#DCC8AE] rounded-xl p-2.5 text-sm text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#5A3E2B] mb-1.5 uppercase tracking-wider">
                  Duration (mins)
                </label>
                <select
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full bg-white border border-[#DCC8AE] rounded-xl p-2.5 text-sm text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
                >
                  <option value={15}>15 mins</option>
                  <option value={30}>30 mins</option>
                  <option value={45}>45 mins</option>
                  <option value={60}>60 mins</option>
                  <option value={90}>90 mins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility & Meeting Permissions */}
          <div className="pt-4 border-t border-[#EADCC8] space-y-3">
            <h3 className="text-sm font-bold text-[#5A3E2B]">Accessibility & Meeting Features</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/50 transition">
                <input
                  type="checkbox"
                  checked={formData.captionsEnabled}
                  onChange={(e) => setFormData({ ...formData, captionsEnabled: e.target.checked })}
                  className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5A3E2B]">
                  <Subtitles className="w-4 h-4 text-[#A67C52]" />
                  <span>Live Captions</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/50 transition">
                <input
                  type="checkbox"
                  checked={formData.signLanguageEnabled}
                  onChange={(e) => setFormData({ ...formData, signLanguageEnabled: e.target.checked })}
                  className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5A3E2B]">
                  <Hand className="w-4 h-4 text-[#A67C52]" />
                  <span>Sign Language AI</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/50 transition">
                <input
                  type="checkbox"
                  checked={formData.allowChat}
                  onChange={(e) => setFormData({ ...formData, allowChat: e.target.checked })}
                  className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5A3E2B]">
                  <MessageSquare className="w-4 h-4 text-[#A67C52]" />
                  <span>Meeting Chat</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F1E8] border border-[#EADCC8] cursor-pointer hover:bg-[#EADCC8]/50 transition">
                <input
                  type="checkbox"
                  checked={formData.allowScreenShare}
                  onChange={(e) => setFormData({ ...formData, allowScreenShare: e.target.checked })}
                  className="rounded text-[#5A3E2B] focus:ring-[#5A3E2B]"
                />
                <div className="flex items-center gap-2 text-xs font-semibold text-[#5A3E2B]">
                  <Laptop className="w-4 h-4 text-[#A67C52]" />
                  <span>Screen Sharing</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 shadow-warm text-sm font-semibold"
          >
            {loading ? 'Creating Meeting...' : 'Schedule & Generate Room Link'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};

export default CreateMeetingPage;
