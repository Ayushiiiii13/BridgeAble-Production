import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Search, Copy, Download, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

const Transcript = () => {
    const { meetingId } = useParams();
    const [transcript, setTranscript] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const data = await api.getTranscript(meetingId);
            setTranscript(data);
            setLoading(false);
        };
        fetch();
    }, [meetingId]);

    const filtered = transcript.filter(t =>
        t.sender.toLowerCase().includes(search.toLowerCase()) ||
        t.text.toLowerCase().includes(search.toLowerCase())
    );

    const handleCopy = () => {
        const text = transcript.map(t => `${t.time} — ${t.sender}: "${t.text}"`).join('\n');
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
                <Link to="/history" className="flex items-center gap-2 text-slate-500 hover:text-bridgeable-navy mb-6 text-sm font-semibold transition-colors">
                    <ArrowLeft size={16} /> Back to History
                </Link>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <PageHeader title="Meeting Transcript" description={`Full transcript for meeting ${meetingId}.`} icon={FileText} />
                    <div className="flex gap-3">
                        <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors">
                            <Copy size={16} /> {copied ? 'Copied!' : 'Copy'}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-bridgeable-navy text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors">
                            <Download size={16} /> Download
                        </button>
                    </div>
                </div>

                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search transcript..."
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
                            <FileText size={40} className="mx-auto mb-3 opacity-30" />
                            <p className="font-medium">No transcript entries found.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filtered.map((entry, i) => (
                                <div key={i} className="flex gap-6 p-5 hover:bg-slate-50 transition-colors items-start">
                                    <span className="font-mono text-xs text-slate-400 shrink-0 pt-0.5 w-16">{entry.time}</span>
                                    <div>
                                        <span className="block text-sm font-bold text-bridgeable-navy mb-1">{entry.sender}</span>
                                        <p className="text-slate-700 leading-relaxed">"{entry.text}"</p>
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

export default Transcript;
