import React, { useState } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { PlusCircle, Calendar as CalendarIcon, Clock, Type, Ear, Mic, Eye, Settings, Users, Link as LinkIcon, CheckCircle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

const CreateMeeting = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdMeeting, setCreatedMeeting] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        duration: '45',
        participants: 1,
        accCaptions: true,
        accSignLanguage: true,
        accRecording: false,
        accChat: true
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newMtg = await api.createMeeting(formData);
            setCreatedMeeting(newMtg);
            setStep(2);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(`bridgeable.app/join/${createdMeeting?.id}`);
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-4xl mx-auto w-full">
                <PageHeader
                    title="Create a Meeting"
                    description="Schedule a new accessible video conference."
                    icon={PlusCircle}
                    color="bg-blue-100"
                    textColor="text-blue-600"
                />

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8">
                        <div className="grid md:grid-cols-2 gap-8">

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-bridgeable-navy flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <CalendarIcon size={20} className="text-slate-400" /> Basic Details
                                </h3>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Meeting Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        required
                                        placeholder="e.g. Weekly Sync"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Description (Optional)</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bridgeable-blue focus:border-bridgeable-blue resize-none"
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Date</label>
                                        <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-bridgeable-blue text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-2">Time</label>
                                        <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-bridgeable-blue text-sm" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Duration (minutes)</label>
                                    <select name="duration" value={formData.duration} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-bridgeable-blue text-sm">
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">1 hour</option>
                                        <option value="120">2 hours</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-lg font-bold text-bridgeable-navy flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <Settings size={20} className="text-slate-400" /> Accessibility & Options
                                </h3>

                                <div className="space-y-4">
                                    <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 flex items-center gap-2"><Type size={16} className="text-bridgeable-blue" /> Enable Live Captions</p>
                                            <p className="text-xs text-slate-500 mt-1">Automatically transcribe speech to text for all participants during the meeting.</p>
                                        </div>
                                        <div className="pt-1">
                                            <input type="checkbox" name="accCaptions" checked={formData.accCaptions} onChange={handleChange} className="w-5 h-5 text-bridgeable-blue rounded border-slate-300 focus:ring-bridgeable-blue" />
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 flex items-center gap-2"><Ear size={16} className="text-teal-600" /> Hand Sign Recognition</p>
                                            <p className="text-xs text-slate-500 mt-1">Allow users to communicate via camera using AI sign language translation.</p>
                                        </div>
                                        <div className="pt-1">
                                            <input type="checkbox" name="accSignLanguage" checked={formData.accSignLanguage} onChange={handleChange} className="w-5 h-5 text-bridgeable-teal rounded border-slate-300 focus:ring-bridgeable-teal" />
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 flex items-center gap-2"><Users size={16} className="text-slate-400" /> Allow Chat</p>
                                            <p className="text-xs text-slate-500 mt-1">Participants can send text messages to each other.</p>
                                        </div>
                                        <div className="pt-1">
                                            <input type="checkbox" name="accChat" checked={formData.accChat} onChange={handleChange} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-600" />
                                        </div>
                                    </label>

                                    <label className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group opacity-75">
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-800 flex items-center gap-2"><Eye size={16} className="text-red-500" /> Record Meeting</p>
                                            <p className="text-xs text-slate-500 mt-1">Save a video recording and full transcript to history.</p>
                                        </div>
                                        <div className="pt-1">
                                            <input type="checkbox" name="accRecording" checked={formData.accRecording} onChange={handleChange} className="w-5 h-5 text-red-500 rounded border-slate-300 focus:ring-red-500" />
                                        </div>
                                    </label>
                                </div>
                            </div>

                        </div>

                        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end gap-4">
                            <Button type="button" onClick={() => navigate('/meetings')} variant="secondary" className="px-6">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting} className="px-8 flex items-center gap-2">
                                {isSubmitting ? 'Creating...' : <><PlusCircle size={18} /> Create Meeting</>}
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-10 text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={40} />
                        </div>

                        <h2 className="text-2xl font-bold text-bridgeable-navy mb-2">Meeting Created Successfully!</h2>
                        <p className="text-slate-500 mb-8">"{formData.title}" scheduled for {formData.date} at {formData.time}.</p>

                        <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-8 flex flex-col items-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Join Details</p>

                            <div className="flex items-center gap-4 w-full bg-white border border-slate-200 p-3 rounded-xl mb-4">
                                <div className="flex-1 font-mono text-sm text-slate-600 truncate text-left pl-2">
                                    bridgeable.app/join/{createdMeeting?.id}
                                </div>
                                <button onClick={handleCopy} className="p-2 bg-blue-50 text-bridgeable-blue hover:bg-bridgeable-blue hover:text-white rounded-lg transition-colors flex items-center gap-2 font-semibold text-xs border border-blue-100">
                                    <Copy size={16} /> Copy
                                </button>
                            </div>

                            <div className="flex items-center justify-between w-full px-4 mt-2 mb-2 text-sm">
                                <span className="text-slate-500 font-medium">Meeting ID:</span>
                                <span className="font-mono font-bold text-bridgeable-navy tracking-widest">{createdMeeting?.id}</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to={`/meetings/join?id=${createdMeeting?.id}`}>
                                <Button className="w-full sm:w-auto px-8 py-3 text-lg font-bold shadow-md shadow-bridgeable-blue/20">Join Now</Button>
                            </Link>
                            <Link to="/meetings">
                                <Button variant="secondary" className="w-full sm:w-auto px-8 py-3 text-lg font-bold">Done</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default CreateMeeting;
