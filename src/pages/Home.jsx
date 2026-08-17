import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Video, Type, Ear, Mic, Volume2, MessageSquare, ArrowRight, Check } from 'lucide-react';

const Home = () => {
    const features = [
        { icon: Video, label: 'Accessible Video Meetings', desc: 'Crystal-clear video conferences designed for everyone.', color: 'bg-blue-50 text-bridgeable-blue', emoji: '🎥' },
        { icon: Type, label: 'Live Captions', desc: 'Auto-generated captions powered by AI in real-time.', color: 'bg-teal-50 text-bridgeable-teal', emoji: '📝' },
        { icon: Ear, label: 'Sign Language Support', desc: 'Gesture recognition translates signs directly in meetings.', color: 'bg-indigo-50 text-indigo-600', emoji: '🤟' },
        { icon: Mic, label: 'Speech to Text', desc: 'Spoken words appear as readable text instantly.', color: 'bg-purple-50 text-purple-600', emoji: '🎙️' },
        { icon: Volume2, label: 'Text to Speech', desc: 'Type a message and let BridgeAble speak it aloud.', color: 'bg-amber-50 text-amber-600', emoji: '🔊' },
        { icon: MessageSquare, label: 'Accessible Chat', desc: 'Full in-meeting chat with dictation and read-aloud.', color: 'bg-pink-50 text-pink-600', emoji: '💬' },
    ];

    const steps = [
        { num: '01', title: 'Create or Schedule', desc: 'Set up a meeting in seconds and customize your accessibility options.' },
        { num: '02', title: 'Invite Participants', desc: 'Share your unique meeting link or ID with anyone.' },
        { num: '03', title: 'Enable Accessibility', desc: 'Toggle captions, sign language, and speech tools before joining.' },
        { num: '04', title: 'Break Barriers', desc: 'Deaf, mute, and hearing participants communicate seamlessly together.' },
    ];

    return (
        <div className="min-h-screen bg-white text-bridgeable-navy font-sans">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-bridgeable-navy to-bridgeable-blue text-white py-24 lg:py-36 px-6">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC4zIiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-blue-200 mb-8">
                        <span className="w-2 h-2 bg-bridgeable-teal rounded-full animate-pulse"></span>
                        Accessibility-first video conferencing
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                        Meet Without<br />
                        <span className="bg-gradient-to-r from-bridgeable-teal to-cyan-400 bg-clip-text text-transparent">Barriers.</span>
                    </h1>

                    <p className="text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
                        BridgeAble makes online meetings more accessible for everyone — with live captions, sign language support, speech-to-text, and inclusive communication tools.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                        <Link to="/signup">
                            <button className="px-8 py-4 bg-bridgeable-teal hover:bg-teal-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-teal-900/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                Create a Meeting <ArrowRight size={20} />
                            </button>
                        </Link>
                        <a href="#how-it-works">
                            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-lg rounded-2xl border border-white/20 transition-all backdrop-blur-sm">
                                See How It Works
                            </button>
                        </a>
                    </div>

                    {/* Mini Meeting Room Preview */}
                    <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-4 shadow-2xl">
                        <div className="bg-slate-900 rounded-2xl p-3 shadow-inner">
                            <div className="bg-slate-800 rounded-xl p-2 flex items-center justify-between mb-3 border border-slate-700">
                                <span className="text-white font-semibold text-sm">📹 Project Review — BridgeAble</span>
                                <span className="text-xs text-red-400 font-bold flex items-center gap-1">● LIVE</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                                {[
                                    { name: 'Ayushi R.', speaking: true, color: 'from-indigo-500 to-purple-500' },
                                    { name: 'Rahul K.', speaking: false, color: 'from-teal-500 to-cyan-500' },
                                    { name: 'Priya M.', speaking: false, color: 'from-blue-500 to-indigo-500' },
                                    { name: 'You', speaking: false, color: 'from-slate-600 to-slate-700' },
                                ].map((p) => (
                                    <div key={p.name} className={`aspect-video bg-gradient-to-br ${p.color} rounded-xl flex items-end justify-start p-2 relative border-2 ${p.speaking ? 'border-bridgeable-teal' : 'border-transparent'}`}>
                                        <span className="text-white text-xs font-semibold bg-black/40 px-2 py-0.5 rounded-full">{p.name}</span>
                                        {p.speaking && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-bridgeable-teal animate-pulse border border-white"></span>}
                                    </div>
                                ))}
                            </div>
                            <div className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-left">
                                <p className="text-bridgeable-teal text-xs font-bold mb-1">Rahul K. · Live Caption</p>
                                <p className="text-white text-sm">"Let's start with the project overview."</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-24 px-6 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-bridgeable-navy mb-4">Built for Everyone</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">Every feature is designed to remove communication barriers between deaf, mute, and hearing participants.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div key={f.label} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all hover:-translate-y-1 group">
                                <div className="text-3xl mb-4">{f.emoji}</div>
                                <h3 className="font-bold text-xl text-bridgeable-navy mb-2">{f.label}</h3>
                                <p className="text-slate-500 text-sm">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="py-24 px-6 bg-white">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold text-bridgeable-navy mb-4">How It Works</h2>
                    </div>
                    <div className="space-y-8">
                        {steps.map((step, i) => (
                            <div key={step.num} className="flex items-start gap-6">
                                <div className="w-14 h-14 shrink-0 rounded-2xl bg-bridgeable-navy text-white flex items-center justify-center font-mono font-bold text-lg shadow-md">
                                    {step.num}
                                </div>
                                <div className="pt-2">
                                    <h3 className="text-xl font-bold text-bridgeable-navy mb-1">{step.title}</h3>
                                    <p className="text-slate-500">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Banner */}
            <section className="py-20 px-6 bg-gradient-to-r from-bridgeable-navy to-bridgeable-blue text-white text-center">
                <h2 className="text-4xl font-extrabold mb-4">Start Meeting Without Barriers</h2>
                <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Free to try. No backend required for the demo. Join the accessible future of communication.</p>
                <Link to="/signup">
                    <button className="px-10 py-4 bg-white text-bridgeable-navy font-bold text-lg rounded-2xl hover:bg-blue-50 transition-all shadow-lg inline-flex items-center gap-2">
                        Get Started — It's Free <ArrowRight size={20} />
                    </button>
                </Link>
            </section>

            <Footer />
        </div>
    );
};

export default Home;
