import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { Clock, Users, FileText, Search } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const History = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await api.getMeetings();
            setMeetings(data.filter(m => m.status === 'Past'));
            setLoading(false);
        };
        fetch();
    }, []);

    const filtered = meetings.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.host.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-5xl mx-auto w-full">
                <PageHeader title="Meeting History" description="Review your past meetings and access transcripts." icon={Clock} />

                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bridgeable-blue text-sm shadow-sm"
                    />
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="py-20 flex justify-center"><LoadingSpinner size="lg" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="py-20 text-center text-slate-400">
                            <Clock size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No meeting history found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filtered.map(m => (
                                <div key={m.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h3 className="font-bold text-bridgeable-navy mb-1">{m.title}</h3>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {m.date} at {m.time}</span>
                                            <span className="flex items-center gap-1.5"><Users size={14} /> {m.participants} participants</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> {m.duration} min</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 shrink-0">
                                        <Link to={`/transcript/${m.id}`}>
                                            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">
                                                <FileText size={15} /> Transcript
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default History;
