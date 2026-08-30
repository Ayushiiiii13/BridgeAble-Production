import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Clock, Users, FileText, ArrowRight, Video, Search } from 'lucide-react';
import { apiService } from '../services/api';

const HistoryPage = () => {
  const [meetings, setMeetings] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await apiService.getMeetings();
        if (res?.meetings) {
          setMeetings(res.meetings);
        }
      } catch (e) {
        console.error('Failed to load history', e);
      }
    };
    fetchHistory();
  }, []);

  const filtered = meetings.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) || m.meetingCode.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">Meeting History & Transcripts</h1>
          <p className="text-sm text-[#7D7167]">Review completed multi-modal transcripts, sign records, and captions</p>
        </div>
      </div>

      <div className="card-warm p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7D7167] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search completed sessions by title or code..."
            className="w-full bg-white border border-[#DCC8AE] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div key={m._id} className="card-interactive p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#5A3E2B] bg-[#EADCC8] px-2 py-0.5 rounded">
                  {m.meetingCode}
                </span>
                <span className="text-xs text-[#7D7167]">
                  {new Date(m.scheduledAt).toLocaleDateString()} at {new Date(m.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h3 className="text-base font-bold text-[#2F261F]">{m.title}</h3>
              <div className="flex items-center gap-4 text-xs text-[#7D7167] pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#A67C52]" /> {m.duration} mins
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#A67C52]" /> {m.participants?.length || 2} participants
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Link
                to={`/transcript/${m.meetingCode || m._id}`}
                className="btn-primary text-xs py-2 px-4 shadow-warm-sm flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Transcript</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
