import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, PlusCircle, Clock, Users, Calendar, Search, Filter } from 'lucide-react';
import { apiService } from '../services/api';

// Refresh meeting status every 60 seconds while the page is open
const POLL_INTERVAL_MS = 60 * 1000;

const STATUS_STYLES = {
  active: 'bg-emerald-100 text-emerald-800',
  scheduled: 'bg-blue-100 text-blue-800',
  ended: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS = {
  active: 'LIVE',
  scheduled: 'SCHEDULED',
  ended: 'ENDED',
};

const MeetingsPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await apiService.getMeetings();
      if (res?.meetings) {
        setMeetings(res.meetings);
      }
    } catch (err) {
      console.error('Error fetching meetings', err);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();

    // Poll for status updates so an open page eventually reflects ENDED
    const timer = setInterval(fetchMeetings, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [fetchMeetings]);

  const filteredMeetings = meetings.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.meetingCode.toLowerCase().includes(search.toLowerCase());
    if (filter === 'active') return matchesSearch && m.status === 'active';
    if (filter === 'scheduled') return matchesSearch && m.status === 'scheduled';
    if (filter === 'ended') return matchesSearch && m.status === 'ended';
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">Meetings</h1>
          <p className="text-sm text-[#7D7167]">Manage, schedule, and join accessible video sessions</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/meetings/create" className="btn-primary text-sm shadow-warm">
            <PlusCircle className="w-4 h-4" />
            <span>Schedule Meeting</span>
          </Link>
          <Link to="/meetings/join" className="btn-secondary text-sm">
            <Video className="w-4 h-4" />
            <span>Join via Code</span>
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="card-warm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#7D7167] absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings by title or code..."
            className="w-full bg-white border border-[#DCC8AE] rounded-xl py-2 pl-9 pr-3 text-xs text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#7D7167] font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'active', 'scheduled', 'ended'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition ${
                filter === type
                  ? 'bg-[#5A3E2B] text-white shadow-warm-sm'
                  : 'bg-[#F7F1E8] text-[#7D7167] hover:bg-[#EADCC8]'
              }`}
            >
              {type === 'active' ? 'Live' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((m) => (
            <div key={m._id} className="card-interactive p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      STATUS_STYLES[m.status] || STATUS_STYLES.ended
                    }`}
                  >
                    {STATUS_LABELS[m.status] || m.status.toUpperCase()}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#5A3E2B] bg-[#EADCC8] px-2 py-0.5 rounded">
                    {m.meetingCode}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#2F261F]">{m.title}</h3>
                <p className="text-xs text-[#7D7167] line-clamp-2">{m.description || 'Inclusive collaborative meeting.'}</p>
              </div>

              <div className="pt-4 border-t border-[#EADCC8] flex items-center justify-between">
                <div className="text-xs text-[#7D7167] space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#A67C52]" />
                    <span>{new Date(m.scheduledAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#A67C52]" />
                    <span>{m.duration} minutes</span>
                  </div>
                </div>

                {m.status === 'ended' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl">
                      Meeting Ended
                    </span>
                    <Link
                      to={`/transcript/${m.meetingCode || m._id}`}
                      className="btn-secondary text-xs py-2 px-4"
                    >
                      <span>Transcript</span>
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/meeting/${m.meetingCode || m._id}/prejoin`)}
                    className="btn-primary text-xs py-2 px-4 shadow-warm-sm"
                  >
                    <span>Join Room</span>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 card-warm text-center p-12 text-[#7D7167] text-sm">
            No meetings found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;
