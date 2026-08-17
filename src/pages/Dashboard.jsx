import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Users, User, LayoutDashboard, LogOut, Video,
    Calendar as CalendarIcon, Clock, ChevronRight, Menu, X, Mic, Plus
} from 'lucide-react';
import Button from '../components/Button';
import { api } from '../services/api';

export const DashboardLayout = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        api.logoutUser();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Meetings', path: '/meetings', icon: Video },
        { name: 'Calendar', path: '/calendar', icon: CalendarIcon },
        { name: 'Contacts', path: '/contacts', icon: Users },
        { name: 'History', path: '/history', icon: Clock },
        { name: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-2 font-bold text-xl text-bridgeable-navy">
                    <div className="w-8 h-8 bg-bridgeable-blue rounded-xl flex items-center justify-center text-white">
                        <Mic size={18} />
                    </div>
                    Bridge<span className="text-bridgeable-teal">Able</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-500">
                    {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Sidebar Navigation */}
            <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static flex flex-col ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div className="p-6 hidden md:flex items-center gap-2 font-bold text-2xl text-bridgeable-navy shrink-0">
                    <div className="w-10 h-10 bg-bridgeable-blue rounded-xl flex items-center justify-center text-white">
                        <Mic size={22} />
                    </div>
                    Bridge<span className="text-bridgeable-teal">Able</span>
                </div>

                <div className="px-4 space-y-1 mt-4 md:mt-0 flex-1 overflow-y-auto pb-4">
                    <Link to="/meetings/create">
                        <Button className="w-full flex items-center justify-center gap-2 mb-4 bg-bridgeable-navy hover:bg-slate-800">
                            <Plus size={18} /> Create Meeting
                        </Button>
                    </Link>

                    <Link to="/meetings/join">
                        <Button variant="secondary" className="w-full flex items-center justify-center gap-2 mb-4">
                            Join Meeting
                        </Button>
                    </Link>

                    <div className="border-t border-slate-100 pt-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${location.pathname === item.path
                                    ? 'bg-blue-50 text-bridgeable-blue'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-bridgeable-navy'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="px-4 pb-4 pt-2 border-t border-slate-100 shrink-0">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50 w-full rounded-xl transition-colors font-medium"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-x-hidden">
                {children}
            </div>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/20 z-20 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}
        </div>
    );
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [meetings, setMeetings] = useState([]);

    useEffect(() => {
        setUser(api.getCurrentUser());
        const fetchMeetings = async () => {
            const data = await api.getMeetings();
            setMeetings(data);
        };
        fetchMeetings();
    }, []);

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full">
                {/* Welcome Hero */}
                <div className="bg-gradient-to-r from-bridgeable-navy to-bridgeable-blue rounded-3xl p-8 lg:p-12 text-white shadow-lg mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/2 rounded-full"></div>
                    <div className="relative z-10">
                        <h1 className="text-3xl lg:text-4xl font-extrabold mb-2">Good morning, {user?.name?.split(' ')[0] || 'User'}</h1>
                        <p className="text-blue-100 text-lg mb-8">Ready to connect without barriers?</p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/meetings/create">
                                <Button className="bg-white text-bridgeable-navy hover:bg-blue-50 px-6 font-bold shadow-sm">
                                    + Create Meeting
                                </Button>
                            </Link>
                            <Link to="/meetings/join">
                                <Button variant="secondary" className="border-white text-white hover:bg-white/10 bg-transparent px-6 font-bold">
                                    Join Meeting
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Upcoming Meetings */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-bridgeable-navy">Upcoming Meetings</h2>
                            <Link to="/meetings" className="text-bridgeable-blue text-sm font-semibold hover:underline flex items-center">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        {meetings.filter(m => m.status === 'Upcoming').map((meeting) => (
                            <div key={meeting.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{meeting.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-slate-500 mt-2">
                                        <span className="flex items-center gap-1"><CalendarIcon size={14} /> {meeting.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {meeting.time}</span>
                                        <span className="flex items-center gap-1"><Users size={14} /> {meeting.participants} Participants</span>
                                    </div>
                                </div>
                                <Link to={`/meetings/join?id=${meeting.id}`}>
                                    <Button className="w-full sm:w-auto px-6 font-semibold">Join Meeting</Button>
                                </Link>
                            </div>
                        ))}

                        {meetings.filter(m => m.status === 'Upcoming').length === 0 && (
                            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-10 text-center text-slate-500">
                                <p>No upcoming meetings scheduled.</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions & Accessibility */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-bridgeable-navy mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <Link to="/meetings/create" className="p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex flex-col items-center justify-center text-center gap-2 cursor-pointer border border-blue-100">
                                    <Plus size={24} />
                                    <span className="text-sm font-semibold">Schedule</span>
                                </Link>
                                <Link to="/meetings/join" className="p-4 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors flex flex-col items-center justify-center text-center gap-2 cursor-pointer border border-teal-100">
                                    <Video size={24} />
                                    <span className="text-sm font-semibold">Join</span>
                                </Link>
                                <Link to="/calendar" className="p-4 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center text-center gap-2 cursor-pointer border border-indigo-100 col-span-2">
                                    <CalendarIcon size={24} />
                                    <span className="text-sm font-semibold">View Calendar</span>
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-bridgeable-navy mb-4">Accessibility First</h2>
                            <p className="text-slate-500 text-sm mb-4">
                                BridgeAble meetings natively support these inclusive features for all participants.
                            </p>
                            <div className="space-y-3">
                                {['Live Captions', 'Sign Language', 'Speech to Text', 'Text to Speech'].map(feature => (
                                    <div key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-lg">
                                        <div className="w-2 h-2 rounded-full bg-bridgeable-teal"></div>
                                        {feature}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
