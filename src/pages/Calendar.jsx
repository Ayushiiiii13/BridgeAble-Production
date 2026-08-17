import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import { Calendar as CalendarIcon, Clock, Users, Video } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const Calendar = () => {
    const today = new Date();
    const [current, setCurrent] = useState({ month: today.getMonth(), year: today.getFullYear() });
    const [meetings, setMeetings] = useState([]);
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    useEffect(() => {
        const fetch = async () => {
            const data = await api.getMeetings();
            setMeetings(data);
        };
        fetch();
    }, []);

    const firstDay = new Date(current.year, current.month, 1).getDay();
    const daysInMonth = new Date(current.year, current.month + 1, 0).getDate();

    const meetingsOnDay = (day) => {
        const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        return meetings.filter(m => m.date === dateStr);
    };

    const selectedMeetings = meetingsOnDay(selectedDay);

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
                <PageHeader title="Calendar" description="View and manage your meeting schedule." icon={CalendarIcon} />

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Calendar Grid */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setCurrent(c => c.month === 0 ? { month: 11, year: c.year - 1 } : { month: c.month - 1, year: c.year })} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">‹</button>
                            <h3 className="text-xl font-bold text-bridgeable-navy">{MONTHS[current.month]} {current.year}</h3>
                            <button onClick={() => setCurrent(c => c.month === 11 ? { month: 0, year: c.year + 1 } : { month: c.month + 1, year: c.year })} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500">›</button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAYS.map(d => <div key={d} className="text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-2">{d}</div>)}
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                const hasMeeting = meetingsOnDay(day).length > 0;
                                const isToday = day === today.getDate() && current.month === today.getMonth() && current.year === today.getFullYear();
                                const isSelected = day === selectedDay;
                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative ${isSelected ? 'bg-bridgeable-blue text-white shadow-md' :
                                                isToday ? 'bg-blue-50 text-bridgeable-blue font-bold border border-bridgeable-blue' :
                                                    'hover:bg-slate-100 text-slate-700'
                                            }`}
                                    >
                                        {day}
                                        {hasMeeting && <div className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-bridgeable-teal'}`}></div>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Meetings for Selected Day */}
                    <div>
                        <h3 className="text-lg font-bold text-bridgeable-navy mb-4">
                            {MONTHS[current.month]} {selectedDay}
                        </h3>
                        {selectedMeetings.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                                <CalendarIcon size={32} className="mx-auto mb-2 opacity-40" />
                                <p className="font-medium">No meetings</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {selectedMeetings.map(m => (
                                    <div key={m.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                        <h4 className="font-bold text-bridgeable-navy mb-3">{m.title}</h4>
                                        <div className="space-y-2 text-sm text-slate-500 mb-4">
                                            <div className="flex items-center gap-2"><Clock size={14} /> {m.time} · {m.duration} min</div>
                                            <div className="flex items-center gap-2"><Users size={14} /> {m.participants} participants</div>
                                        </div>
                                        <Link to={`/meetings/join?id=${m.id}`}>
                                            <button className="w-full py-2.5 bg-bridgeable-blue text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                                <Video size={16} /> Join Meeting
                                            </button>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            <Link to="/meetings/create">
                                <button className="w-full py-3 border-2 border-dashed border-slate-300 text-slate-500 hover:border-bridgeable-blue hover:text-bridgeable-blue rounded-2xl font-semibold text-sm transition-colors">
                                    + Schedule Meeting
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Calendar;
