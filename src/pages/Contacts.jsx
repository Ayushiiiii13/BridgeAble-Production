import React, { useState } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import { Users, Search, Video, MessageSquare, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const mockContacts = [
    { id: 1, name: 'Ayushi Rathi', role: 'Product Designer', online: true, color: 'from-purple-500 to-indigo-500' },
    { id: 2, name: 'Rahul Kumar', role: 'Backend Engineer', online: true, color: 'from-teal-500 to-cyan-500' },
    { id: 3, name: 'Priya Mehta', role: 'AI/ML Developer', online: false, color: 'from-blue-500 to-indigo-500' },
    { id: 4, name: 'Arjun Singh', role: 'DevOps Engineer', online: false, color: 'from-amber-500 to-orange-500' },
    { id: 5, name: 'Meera Shah', role: 'QA Engineer', online: true, color: 'from-pink-500 to-rose-500' },
    { id: 6, name: 'Dev Patel', role: 'Mobile Developer', online: false, color: 'from-green-500 to-teal-500' },
];

const Contacts = () => {
    const [search, setSearch] = useState('');

    const filtered = mockContacts.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.role.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <PageHeader title="Contacts" description="Your team and meeting participants." icon={Users} />
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-bridgeable-navy text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">
                        <UserPlus size={16} /> Add Contact
                    </button>
                </div>

                <div className="relative mb-6">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search contacts..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-bridgeable-blue text-sm shadow-sm"
                    />
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(c => (
                        <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all group flex flex-col items-center text-center">
                            <div className="relative mb-4">
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                                    {c.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${c.online ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                            </div>
                            <h3 className="font-bold text-bridgeable-navy text-base mb-1">{c.name}</h3>
                            <p className="text-slate-500 text-sm mb-1">{c.role}</p>
                            <p className={`text-xs font-semibold mb-5 ${c.online ? 'text-green-600' : 'text-slate-400'}`}>
                                {c.online ? '● Online' : '○ Offline'}
                            </p>
                            <div className="flex gap-3 w-full">
                                <Link to="/meetings/create" className="flex-1">
                                    <button className="w-full py-2 rounded-xl bg-bridgeable-blue text-white text-xs font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                                        <Video size={14} /> Invite
                                    </button>
                                </Link>
                                <button className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5">
                                    <MessageSquare size={14} /> Message
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Contacts;
