import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video, PlusCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState('October 2026');
  const navigate = useNavigate();

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  const sampleEvents = {
    4: [{ title: 'Accessibility Team Sync', time: '10:00 AM', code: 'BRG-82K4-XP' }],
    12: [{ title: 'Deaf & Non-Speaking Sprint Review', time: '02:00 PM', code: 'BRG-49M2-ZW' }],
    19: [{ title: 'Live Caption Model Testing', time: '11:30 AM', code: 'BRG-19A7-LK' }],
    26: [{ title: 'Sign Language AI Benchmark', time: '04:00 PM', code: 'BRG-77E1-QP' }],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">Meeting Calendar</h1>
          <p className="text-sm text-[#7D7167]">Track and schedule your upcoming accessibility sessions</p>
        </div>

        <Link to="/meetings/create" className="btn-primary text-sm shadow-warm">
          <PlusCircle className="w-4 h-4" />
          <span>New Meeting</span>
        </Link>
      </div>

      {/* Calendar Card */}
      <div className="card-warm p-6 space-y-6 shadow-warm-lg">
        {/* Month Navigator */}
        <div className="flex items-center justify-between border-b border-[#EADCC8] pb-4">
          <h2 className="text-lg font-bold text-[#5A3E2B] flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#A67C52]" />
            <span>{currentMonth}</span>
          </h2>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl border border-[#DCC8AE] bg-[#F7F1E8] text-[#5A3E2B] hover:bg-[#EADCC8] transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 rounded-xl border border-[#DCC8AE] bg-[#F7F1E8] text-[#5A3E2B] hover:bg-[#EADCC8] transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[#7D7167] uppercase">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const events = sampleEvents[day] || [];
            const hasEvents = events.length > 0;

            return (
              <div
                key={day}
                className={`min-h-[90px] p-2 rounded-xl border transition flex flex-col justify-between ${
                  hasEvents
                    ? 'bg-[#EADCC8]/40 border-[#DCC8AE]'
                    : 'bg-[#F7F1E8]/50 border-[#EADCC8] hover:bg-[#EADCC8]/20'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-[#5A3E2B]">
                  <span>{day}</span>
                  {hasEvents && <span className="w-2 h-2 rounded-full bg-[#A67C52]"></span>}
                </div>

                <div className="space-y-1">
                  {events.map((ev, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/meeting/${ev.code}/prejoin`)}
                      className="w-full text-left bg-[#5A3E2B] text-[#FBF8F3] p-1.5 rounded-lg text-[10px] font-medium leading-tight shadow-warm-sm hover:bg-[#422D1F] transition block truncate"
                      title={`${ev.title} (${ev.time})`}
                    >
                      {ev.time} • {ev.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
