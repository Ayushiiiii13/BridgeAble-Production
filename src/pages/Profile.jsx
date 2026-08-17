import React, { useState, useEffect } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { User, Camera, Bell, Globe, Shield, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [saved, setSaved] = useState(false);
    const [prefs, setPrefs] = useState({
        captions: true,
        signLanguage: true,
        highContrast: false,
        largeText: false,
        commMethod: 'All'
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const data = await api.getUserProfile();
            setUser(data);
        };
        fetchUser();
    }, []);

    const handleSave = async () => {
        await api.saveAccessibilityPreferences(prefs);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleLogout = () => {
        api.logoutUser();
        navigate('/');
    };

    const Toggle = ({ label, desc, checked, onChange }) => (
        <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
            <div>
                <p className="font-bold text-sm text-slate-800">{label}</p>
                {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={`w-12 h-6 rounded-full relative transition-colors ${checked ? 'bg-bridgeable-blue' : 'bg-slate-200'}`}
            >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-7' : 'left-1'}`}></span>
            </button>
        </div>
    );

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
                <PageHeader title="Account & Preferences" description="Manage your profile and accessibility settings." icon={User} />

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Avatar Card */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                            <div className="relative mb-4 group cursor-pointer">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-bridgeable-blue to-bridgeable-teal text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <h2 className="text-xl font-bold text-bridgeable-navy mb-1">{user?.name || 'Demo User'}</h2>
                            <p className="text-slate-500 text-sm mb-6">{user?.email || 'demo@example.com'}</p>

                            <div className="w-full space-y-2">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    <LogOut size={16} /> Sign Out
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Settings Panel */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Personal Info */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-bridgeable-navy mb-5 flex items-center gap-2">
                                <User size={18} className="text-bridgeable-blue" /> Personal Information
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-5 mb-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Full Name</label>
                                    <input type="text" readOnly value={user?.name || 'Demo User'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Email Address</label>
                                    <input type="email" readOnly value={user?.email || 'demo@example.com'} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Preferred Communication Method</label>
                                <select
                                    value={prefs.commMethod}
                                    onChange={e => setPrefs(p => ({ ...p, commMethod: e.target.value }))}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-bridgeable-blue text-slate-800"
                                >
                                    <option>All</option>
                                    <option>Sign Language</option>
                                    <option>Speech</option>
                                    <option>Text Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Accessibility Prefs */}
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-bridgeable-navy mb-5 flex items-center gap-2">
                                <Shield size={18} className="text-bridgeable-blue" /> Accessibility Preferences
                            </h3>
                            <div className="space-y-3">
                                <Toggle label="Live Captions" desc="Enable captions by default in meetings" checked={prefs.captions} onChange={v => setPrefs(p => ({ ...p, captions: v }))} />
                                <Toggle label="Sign Language Support" desc="Enable gesture panel in meetings" checked={prefs.signLanguage} onChange={v => setPrefs(p => ({ ...p, signLanguage: v }))} />
                                <Toggle label="High Contrast Mode" desc="Increase UI contrast for readability" checked={prefs.highContrast} onChange={v => setPrefs(p => ({ ...p, highContrast: v }))} />
                                <Toggle label="Large Text" desc="Increase font size globally" checked={prefs.largeText} onChange={v => setPrefs(p => ({ ...p, largeText: v }))} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button variant="secondary" className="px-6">Cancel</Button>
                            <Button className="px-8" onClick={handleSave}>
                                {saved ? '✓ Saved!' : 'Save Preferences'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
