import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './Dashboard';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { Video, Calendar as CalendarIcon, Clock, Users, Plus, Copy, Edit2, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Meetings = () => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMeetings = async () => {
            setIsLoading(true);
            const data = await api.getMeetings();
            setMeetings(data);
            setIsLoading(false);
        };
        fetchMeetings();
    }, []);

    const filteredMeetings = meetings.filter(m => {
        if (activeTab === 'Upcoming') return m.status === 'Upcoming';
        if (activeTab === 'Past') return m.status === 'Past';
        return m.status === 'Scheduled' || m.status === 'Upcoming';
    });

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <PageHeader
                        title="My Meetings"
                        description="Manage your upcoming video conferences and past sessions."
                        icon={Video}
                        color="bg-indigo-100"
                        textColor="text-indigo-600"
                    />
                    <Link to="/meetings/create">
                        <Button className="flex items-center gap-2"><Plus size={18} /> Create Meeting</Button>
                    </Link>
                </div>

                <div className="flex border-b border-slate-200 mb-6 space-x-8">
                    {['Upcoming', 'Scheduled', 'Past'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 text-sm font-semibold transition-colors relative ${activeTab === tab ? 'text-bridgeable-blue' : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-bridgeable-blue rounded-t-full"></div>
                            )}
                        </button>
                    ))}
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
                ) : filteredMeetings.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4">
                            <Video size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No {activeTab.toLowerCase()} meetings</h3>
                        <p className="text-slate-500 max-w-md mb-6">You don't have any {activeTab.toLowerCase()} meetings right now. You can create a new one to get started.</p>
                        {activeTab !== 'Past' && (
                            <Link to="/meetings/create">
                                <Button variant="secondary">Schedule New Meeting</Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredMeetings.map(meeting => (
                            <div key={meeting.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-bridgeable-navy">{meeting.title}</h3>
                                        <p className="text-sm text-slate-500 font-medium">Host: <span className="text-slate-700">{meeting.host}</span></p>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${meeting.status === 'Upcoming' ? 'bg-blue-50 text-blue-600' :
                                            meeting.status === 'Past' ? 'bg-slate-100 text-slate-500' :
                                                'bg-amber-50 text-amber-600'
                                        }`}>
                                        {meeting.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-slate-600 mt-auto">
                                    <div className="flex items-center gap-2"><CalendarIcon size={16} className="text-slate-400" /> {meeting.date}</div>
                                    <div className="flex items-center gap-2"><Clock size={16} className="text-slate-400" /> {meeting.time} ({meeting.duration} min)</div>
                                    <div className="flex items-center gap-2"><Users size={16} className="text-slate-400" /> {meeting.participants} Participants</div>
                                    <div className="flex items-center gap-2 text-slate-400 font-mono text-xs">ID: {meeting.id}</div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
                                    {meeting.status !== 'Past' ? (
                                        <>
                                            <Link to={`/meetings/join?id=${meeting.id}`} className="flex-1">
                                                <Button className="w-full">Join</Button>
                                            </Link>
                                            <button className="p-2.5 text-slate-400 hover:text-bridgeable-blue hover:bg-blue-50 rounded-xl transition-colors border border-slate-200" title="Copy Link">
                                                <Copy size={20} />
                                            </button>
                                            <button className="p-2.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-colors border border-slate-200" title="Edit">
                                                <Edit2 size={20} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="secondary" className="flex-1">View Details</Button>
                                            <button className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-slate-200" title="Delete record">
                                                <Trash2 size={20} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Meetings;
