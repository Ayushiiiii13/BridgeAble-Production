import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from './Dashboard';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import { Video, Camera, Mic, MicOff, CameraOff, Settings, Sparkles, Check } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const JoinMeeting = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const initialId = searchParams.get('id') || '';

    const [meetingId, setMeetingId] = useState(initialId);
    const [isCamOn, setIsCamOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
    const [accSignLang, setAccSignLang] = useState(true);
    const [accCaptions, setAccCaptions] = useState(true);

    const videoRef = useRef(null);
    const streamRef = useRef(null);

    useEffect(() => {
        // Start camera stream for preview if cam is on
        const initCamera = async () => {
            try {
                if (isCamOn) {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                    streamRef.current = stream;
                } else {
                    stopStream();
                }
            } catch (err) {
                console.error("No camera found", err);
                setIsCamOn(false);
            }
        };
        initCamera();

        return () => stopStream();
    }, [isCamOn]);

    const stopStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const handleJoin = (e) => {
        e.preventDefault();
        if (!meetingId.trim()) return;
        navigate(`/meeting/${meetingId}?cam=${isCamOn}&mic=${isMicOn}&signTheme=${accSignLang}&cc=${accCaptions}`);
    };

    return (
        <DashboardLayout>
            <div className="p-6 lg:p-10 max-w-6xl mx-auto w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-bridgeable-navy mb-4">Join a Meeting</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">Configure your accessibility preferences and check your preview before joining the room.</p>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col md:flex-row gap-10">
                    {/* Camera Preview */}
                    <div className="md:w-1/2 flex flex-col items-center">
                        <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden relative shadow-inner mb-6 flex items-center justify-center">
                            {isCamOn ? (
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover transform -scale-x-100"
                                />
                            ) : (
                                <div className="text-slate-500 flex flex-col items-center">
                                    <CameraOff size={48} className="mb-2 opacity-50" />
                                    <p className="font-medium">Camera is off</p>
                                </div>
                            )}

                            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                <button
                                    onClick={() => setIsMicOn(!isMicOn)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${isMicOn ? 'bg-slate-700/80 hover:bg-slate-600 text-white backdrop-blur-sm' : 'bg-red-500 text-white'}`}
                                >
                                    {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                                </button>
                                <button
                                    onClick={() => setIsCamOn(!isCamOn)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-lg ${isCamOn ? 'bg-slate-700/80 hover:bg-slate-600 text-white backdrop-blur-sm' : 'bg-red-500 text-white'}`}
                                >
                                    {isCamOn ? <Video size={20} /> : <CameraOff size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="w-full bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                            <Sparkles size={20} className="text-bridgeable-blue shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-bridgeable-navy">Ready to join?</h4>
                                <p className="text-xs text-slate-500 mt-1">Make sure you are positioned clearly in frame if you plan to use Sign Language recognition.</p>
                            </div>
                        </div>
                    </div>

                    {/* Form and Settings */}
                    <div className="md:w-1/2 flex flex-col justify-center">
                        <form onSubmit={handleJoin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Target Meeting</label>
                                <input
                                    type="text"
                                    placeholder="Enter Meeting ID or personal link"
                                    value={meetingId}
                                    onChange={(e) => setMeetingId(e.target.value)}
                                    required
                                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bridgeable-blue text-lg font-medium text-slate-800"
                                />
                            </div>

                            <div className="border-t border-slate-100 pt-6">
                                <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Settings size={16} /> Pre-join Accessibility Toggles
                                </label>

                                <div className="space-y-3">
                                    <button type="button" onClick={() => setAccCaptions(!accCaptions)} className={`w-full p-4 border rounded-xl flex items-center justify-between transition-colors ${accCaptions ? 'border-bridgeable-blue bg-blue-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-bold text-slate-800">Live Captions</span>
                                            <span className="text-xs text-slate-500 mt-0.5">Show real-time transcription overlay</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${accCaptions ? 'bg-bridgeable-blue text-white' : 'bg-slate-100 border border-slate-300'}`}>
                                            {accCaptions && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </button>

                                    <button type="button" onClick={() => setAccSignLang(!accSignLang)} className={`w-full p-4 border rounded-xl flex items-center justify-between transition-colors ${accSignLang ? 'border-bridgeable-teal bg-teal-50/50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
                                        <div className="flex flex-col items-start text-left">
                                            <span className="font-bold text-slate-800">Sign Language Support</span>
                                            <span className="text-xs text-slate-500 mt-0.5">Activate camera interaction model</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${accSignLang ? 'bg-bridgeable-teal text-white' : 'bg-slate-100 border border-slate-300'}`}>
                                            {accSignLang && <Check size={14} strokeWidth={3} />}
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button type="submit" className="w-full py-4 text-lg font-bold shadow-lg shadow-bridgeable-blue/20" disabled={!meetingId.trim()}>
                                    Join Room
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default JoinMeeting;
