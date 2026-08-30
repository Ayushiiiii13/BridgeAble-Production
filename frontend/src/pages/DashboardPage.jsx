import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Video, 
  PlusCircle, 
  Clock, 
  Users, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  Hand, 
  Subtitles, 
  Volume2, 
  Sliders 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await apiService.getMeetings();
      if (res?.meetings) {
        setMeetings(res.meetings);
      }
    } catch (e) {
      console.error('Failed to load meetings', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
    // Poll every 60 seconds so status updates (e.g. meeting ending) appear without a manual refresh
    const timer = setInterval(fetchMeetings, 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchMeetings]);

  // Scheduled or active (live) meetings that haven't ended
  const upcomingMeetings = meetings.filter(m => m.status !== 'ended');
  const recentMeetings = meetings.filter(m => m.status === 'ended');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#5A3E2B] via-[#7A5A42] to-[#5A3E2B] rounded-3xl p-6 sm:p-8 text-[#FBF8F3] shadow-warm-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#EADCC8]/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-[#EADCC8]">
            <Sparkles className="w-3.5 h-3.5" />
            Accessibility-First Workspace
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#FBF8F3] tracking-tight brand-font">
            Good morning, {user?.name ? user.name.split(' ')[0] : 'there'}!
          </h1>
          <p className="text-sm sm:text-base text-[#EADCC8] leading-relaxed">
            Ready to connect? Your live captions, speech synthesis, and sign language models are initialized and ready for meetings.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/meetings/create"
              className="bg-[#EADCC8] hover:bg-white text-[#5A3E2B] text-sm font-bold px-5 py-2.5 rounded-xl shadow-warm transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Meeting</span>
            </Link>

            <Link
              to="/meetings/join"
              className="bg-black/20 hover:bg-black/40 text-white border border-[#EADCC8]/40 text-sm font-medium px-5 py-2.5 rounded-xl transition flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Join via Code</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 bg-[#A67C52]/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Meetings', val: `${meetings.length}`, icon: Video },
          { label: 'Upcoming / Active', val: `${upcomingMeetings.length}`, icon: Clock },
          { label: 'Completed Sessions', val: `${recentMeetings.length}`, icon: Users },
          { label: 'Saved Records', val: `${meetings.length}`, icon: FileText },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-warm p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#EADCC8] flex items-center justify-center text-[#5A3E2B] shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#5A3E2B] brand-font">{stat.val}</p>
                <p className="text-xs text-[#7D7167] font-medium">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>


      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Upcoming Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#5A3E2B] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#A67C52]" />
              <span>Upcoming & Active Meetings</span>
            </h2>
            <Link to="/meetings" className="text-xs font-bold text-[#5A3E2B] hover:underline flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <div
                  key={meeting._id}
                  className="card-interactive p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      {meeting.status === 'active' ? (
                        <span className="badge-green">Live</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Scheduled
                        </span>
                      )}
                      <span className="text-xs font-mono font-bold text-[#7A5A42] bg-[#EADCC8] px-2 py-0.5 rounded">
                        {meeting.meetingCode}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-[#2F261F]">{meeting.title}</h3>
                    <p className="text-xs text-[#7D7167]">{meeting.description || 'Accessibility sync session'}</p>
                    <div className="flex items-center gap-4 text-xs text-[#7D7167] pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#A67C52]" />
                        {new Date(meeting.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#A67C52]" />
                        {meeting.participants?.length || 1} participant(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => navigate(`/meeting/${meeting.meetingCode || meeting._id}/prejoin`)}
                      className="btn-primary text-xs py-2 px-4 shadow-warm-sm"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Room</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="card-warm text-center p-8 text-sm text-[#7D7167]">
                No upcoming meetings scheduled right now.
              </div>
            )}
          </div>

          {/* Recent Transcripts preview */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#5A3E2B] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#A67C52]" />
                <span>Recent Meeting Transcripts</span>
              </h2>
              <Link to="/history" className="text-xs font-bold text-[#5A3E2B] hover:underline flex items-center gap-1">
                <span>All History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentMeetings.slice(0, 2).map((m) => (
                <div key={m._id} className="card-warm p-4 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#5A3E2B]">{m.title}</h4>
                    <p className="text-xs text-[#7D7167]">Completed • {m.duration} mins • Multi-modal transcript available</p>
                  </div>
                  <Link
                    to={`/transcript/${m.meetingCode || m._id}`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <span>View Transcript</span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Accessibility Status & Quick Config */}
        <div className="space-y-6">
          <div className="card-warm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#EADCC8] pb-3">
              <h3 className="font-bold text-sm text-[#5A3E2B] flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#A67C52]" />
                <span>Accessibility Preferences</span>
              </h3>
              <Link to="/settings" className="text-xs text-[#A67C52] font-semibold hover:underline">
                Edit
              </Link>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F1E8]">
                <span className="flex items-center gap-2 text-[#2F261F] font-medium">
                  <Subtitles className="w-4 h-4 text-[#5A3E2B]" />
                  Live Captions
                </span>
                <span className="font-bold text-emerald-700">Enabled</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F1E8]">
                <span className="flex items-center gap-2 text-[#2F261F] font-medium">
                  <Hand className="w-4 h-4 text-[#5A3E2B]" />
                  Sign Language AI
                </span>
                <span className="font-bold text-emerald-700">Active</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F1E8]">
                <span className="flex items-center gap-2 text-[#2F261F] font-medium">
                  <Volume2 className="w-4 h-4 text-[#5A3E2B]" />
                  Speech Synthesis (TTS)
                </span>
                <span className="font-bold text-emerald-700">Ready</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                to="/settings"
                className="w-full btn-secondary text-xs py-2 text-center block"
              >
                Customize Visuals & Speech
              </Link>
            </div>
          </div>

          {/* Quick Start Card */}
          <div className="bg-[#EADCC8] border border-[#DCC8AE] rounded-2xl p-6 text-[#5A3E2B] space-y-3">
            <h3 className="font-bold text-sm">Need an instant meeting?</h3>
            <p className="text-xs text-[#7A5A42] leading-relaxed">
              Start an instant accessible conference call and invite colleagues with your unique room link.
            </p>
            <button
              onClick={() => navigate('/meeting/BRG-82K4-XP/prejoin')}
              className="w-full btn-primary text-xs py-2.5 shadow-warm"
            >
              Start Instant Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
