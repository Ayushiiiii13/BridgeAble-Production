import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Mic, MicOff, Video, CameraOff, MonitorUp, Type, MessageSquare,
    Users, PhoneMissed, Ear, Settings, X, Send, Play, Copy
} from 'lucide-react';
import { api } from '../services/api';

const ParticipantVideo = ({ participant, size, localVideoRef }) => {
    const initials = participant.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <div className={`relative bg-slate-800 rounded-2xl overflow-hidden shadow-md flex items-center justify-center border-2 transition-colors ${participant.isSpeaking ? 'border-bridgeable-blue' : 'border-transparent'} ${size}`}>
            {!participant.isCameraOn ? (
                <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-700 text-slate-300 rounded-full flex items-center justify-center text-2xl font-bold mb-3 shadow-inner">
                        {initials}
                    </div>
                    <span className="text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">{participant.name}</span>
                </div>
            ) : (
                <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 z-10 w-full h-full pointer-events-none">
                        <span className="text-white text-sm font-medium">{participant.name} {participant.isMe ? '(You)' : ''}</span>
                    </div>
                    {participant.isMe ? (
                        /* Bind the real local camera stream for the current user */
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                        />
                    ) : (
                        <div className="w-full h-full relative overflow-hidden bg-slate-900 flex items-center justify-center">
                            <div className="w-32 h-32 opacity-10 rounded-full blur-xl bg-blue-500 absolute"></div>
                            <div className="text-slate-600">Video Signal</div>
                        </div>
                    )}
                </>
            )}

            {/* Status Indicators */}
            <div className="absolute top-4 right-4 flex gap-2 z-20">
                {participant.isMuted && (
                    <div className="w-8 h-8 rounded-full bg-red-500/90 flex items-center justify-center text-white backdrop-blur-sm shadow-sm">
                        <MicOff size={14} />
                    </div>
                )}
            </div>

            {/* Speaking Indicator Rings */}
            {participant.isSpeaking && (
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full border-2 border-bridgeable-blue animate-ping"></div>
            )}
        </div>
    );
};

const MeetingRoom = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    // Parse initial settings from pre-join screen
    const searchParams = new URLSearchParams(location.search);
    const initCam = searchParams.get('cam') !== 'false';
    const initMic = searchParams.get('mic') !== 'false';
    const initCc = searchParams.get('cc') !== 'false';
    const initSign = searchParams.get('signTheme') !== 'false';

    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [transcript, setTranscript] = useState([]);
    const [meetingInfo, setMeetingInfo] = useState({ id: meetingId, title: 'Meeting Room', status: 'In Progress' });
    const [currentUser, setCurrentUser] = useState(null);

    // Controls State
    const [isCamOn, setIsCamOn] = useState(initCam);
    const [isMicOn, setIsMicOn] = useState(initMic);
    const [sidebarTab, setSidebarTab] = useState('chat'); // chat, participants, access
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Accessibility State
    const [showCaptions, setShowCaptions] = useState(initCc);
    const [showSignPanel, setShowSignPanel] = useState(initSign);
    const [highContrast, setHighContrast] = useState(false);
    const [largeText, setLargeText] = useState(false);

    // Chat & STT
    const [chatInput, setChatInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef(null);

    // Sign Language Mock
    const [signCameraActive, setSignCameraActive] = useState(false);
    const [detectedSign, setDetectedSign] = useState('');
    const signVideoRef = useRef(null);
    const signStreamRef = useRef(null);

    // Local camera stream for the current user's own tile
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);

    useEffect(() => {
        const initMeeting = async () => {
            const user = api.getCurrentUser();
            setCurrentUser(user);
            const info = await api.joinMeeting(meetingId);
            setMeetingInfo(info);
            const parts = await api.getParticipants(meetingId);
            const msgs = await api.getMessages(meetingId);
            const scripts = await api.getTranscript(meetingId);

            // Apply initial states to self
            setParticipants(parts.map(p => p.isMe ? { ...p, isCameraOn: initCam, isMuted: !initMic } : p));
            setMessages(msgs);
            setTranscript(scripts);
        };
        initMeeting();

        // Start local camera stream
        const startLocalStream = async () => {
            if (!initCam) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                localStreamRef.current = stream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Could not access camera:', err);
            }
        };
        startLocalStream();

        // Setup Web Speech API for dictate
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRec();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            recognitionRef.current.onresult = (event) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        setChatInput(prev => prev + event.results[i][0].transcript + ' ');
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
            };
        }

        return () => {
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
            if (signStreamRef.current) signStreamRef.current.getTracks().forEach(track => track.stop());
            if (recognitionRef.current) recognitionRef.current.stop();
        };
    }, [meetingId]);

    // Handlers
    const toggleMic = () => {
        setIsMicOn(!isMicOn);
        setParticipants(prev => prev.map(p => p.isMe ? { ...p, isMuted: isMicOn } : p));
    };

    const toggleCam = async () => {
        const newState = !isCamOn;
        setIsCamOn(newState);
        setParticipants(prev => prev.map(p => p.isMe ? { ...p, isCameraOn: newState } : p));
        if (newState) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                localStreamRef.current = stream;
                if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            } catch (err) { console.error(err); }
        } else {
            if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
            if (localVideoRef.current) localVideoRef.current.srcObject = null;
        }
    };

    const toggleSidebar = (tab) => {
        if (isSidebarOpen && sidebarTab === tab) {
            setIsSidebarOpen(false);
        } else {
            setSidebarTab(tab);
            setIsSidebarOpen(true);
        }
    };

    const sendChatMessage = async (e) => {
        e?.preventDefault();
        if (!chatInput.trim()) return;
        const newMsg = await api.sendMessage(meetingId, chatInput);
        setMessages(prev => [...prev, newMsg]);
        setChatInput('');
    };

    const toggleDictation = () => {
        if (!recognitionRef.current) return alert("Speech Recognition not supported in this browser.");
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const playTTS = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Sign Language Panel handlers
    const toggleSignPanel = () => {
        setShowSignPanel(!showSignPanel);
        if (showSignPanel && signStreamRef.current) {
            signStreamRef.current.getTracks().forEach(t => t.stop());
            setSignCameraActive(false);
        }
    };

    const startSignCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (signVideoRef.current) signVideoRef.current.srcObject = stream;
            signStreamRef.current = stream;
            setSignCameraActive(true);
            setDetectedSign('Processing gestures...');

            // Mock recognition output
            setTimeout(async () => {
                const result = await api.translateSign();
                setDetectedSign(result.text);
            }, 3000);
        } catch (err) {
            console.error(err);
        }
    };
    const stopSignCamera = () => {
        if (signStreamRef.current) signStreamRef.current.getTracks().forEach(t => t.stop());
        setSignCameraActive(false);
        setDetectedSign('');
    };
    const sendSignMessage = () => {
        if (detectedSign && detectedSign !== 'Processing gestures...') {
            setChatInput(detectedSign);
            setSidebarTab('chat');
            setIsSidebarOpen(true);
        }
    };

    // Derived states
    const mainParticipant = participants.find(p => p.isSpeaking) || participants[1] || participants[0];
    const otherParticipants = participants.filter(p => p.id !== mainParticipant?.id);

    return (
        <div className={`h-screen w-full flex flex-col bg-slate-950 text-white font-sans ${highContrast ? 'contrast-125' : ''} ${largeText ? 'text-lg' : ''}`}>

            {/* Top Header */}
            <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-lg">{meetingInfo.title}</span>
                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-bold rounded-md flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div> REC
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-mono text-slate-400">
                    ID: {meetingId} <button className="hover:text-white"><Copy size={14} /></button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative">

                {/* Video Grid Area */}
                <div className={`flex-1 flex flex-col p-4 gap-4 transition-all duration-300 relative ${isSidebarOpen ? 'mr-0 md:mr-80' : ''}`}>

                    <div className="flex-1 flex gap-4 min-h-0">
                        {/* Speaker View */}
                        <div className="flex-1 h-full">
                            {mainParticipant && <ParticipantVideo participant={mainParticipant} size="w-full h-full" localVideoRef={localVideoRef} />}
                        </div>

                        {/* Side Strip of Others */}
                        <div className="w-48 xl:w-64 flex flex-col gap-4 overflow-y-auto hidden md:flex">
                            {otherParticipants.map(p => (
                                <ParticipantVideo key={p.id} participant={p} size="w-full aspect-video h-auto shrink-0" localVideoRef={localVideoRef} />
                            ))}
                        </div>
                    </div>

                    {/* Captions Panel overlaying the bottom of the video grid */}
                    {showCaptions && (
                        <div className="absolute bottom-24 left-0 right-0 px-8 flex justify-center pointer-events-none z-20">
                            <div className="bg-black/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-center max-w-3xl transform transition-transform">
                                <p className="text-bridgeable-teal text-sm font-bold mb-1">Rahul</p>
                                <p className={`text-white font-medium ${largeText ? 'text-4xl' : 'text-2xl'}`}>"Let's discuss the project."</p>
                            </div>
                        </div>
                    )}

                    {/* Bottom Controls Bar */}
                    <div className="h-20 bg-slate-900 border border-slate-700/50 rounded-2xl flex items-center justify-between px-4 lg:px-8 mt-2 shadow-2xl shrink-0 absolute bottom-4 left-4 right-4 md:static md:bottom-0">

                        {/* Left: AV Controls */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            <button onClick={toggleMic} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors shadow-sm ${!isMicOn ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                {!isMicOn ? <MicOff size={20} /> : <Mic size={20} />}
                            </button>
                            <button onClick={toggleCam} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors shadow-sm ${!isCamOn ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                {!isCamOn ? <CameraOff size={20} /> : <Video size={20} />}
                            </button>
                        </div>

                        {/* Center: Meeting Controls */}
                        <div className="flex items-center gap-2">
                            <button className="w-12 h-12 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 flex flex-col items-center justify-center shadow-sm hidden sm:flex">
                                <MonitorUp size={20} />
                            </button>
                            <div className="w-px h-8 bg-slate-700 mx-1 hidden sm:block"></div>

                            <button onClick={() => setShowCaptions(!showCaptions)} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-sm transition-colors ${showCaptions ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                <Type size={20} />
                            </button>
                            <button onClick={() => toggleSignPanel()} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-sm transition-colors ${showSignPanel ? 'bg-teal-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                <Ear size={20} />
                            </button>
                        </div>

                        {/* Right: Sidebar & Leave */}
                        <div className="flex items-center gap-2 lg:gap-4">
                            <button onClick={() => toggleSidebar('participants')} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${isSidebarOpen && sidebarTab === 'participants' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                <Users size={20} />
                            </button>
                            <button onClick={() => toggleSidebar('chat')} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors ${isSidebarOpen && sidebarTab === 'chat' ? 'bg-slate-200 text-slate-900 border border-slate-300' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
                                <MessageSquare size={20} />
                            </button>
                            <div className="w-px h-8 bg-slate-700 mx-1 hidden md:block"></div>
                            <button onClick={() => navigate('/dashboard')} className="px-6 h-12 bg-red-600 text-white hover:bg-red-700 font-bold rounded-xl shadow-md transition-colors flex items-center justify-center text-sm">
                                Leave
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Sidebar Overlay/Static */}
                <div className={`fixed inset-y-14 right-0 w-full sm:w-80 md:w-80 lg:w-96 bg-white border-l border-slate-200 z-30 transition-transform duration-300 ease-in-out text-slate-800 flex flex-col shadow-2xl ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="h-14 border-b border-slate-200 flex items-center justify-between px-4 shrink-0 bg-slate-50">
                        <div className="font-bold text-bridgeable-navy uppercase text-sm tracking-wider">
                            {sidebarTab === 'chat' && 'In-Call Messages'}
                            {sidebarTab === 'participants' && 'People'}
                            {sidebarTab === 'access' && 'Accessibility'}
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setSidebarTab('access')} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
                                <Settings size={18} />
                            </button>
                            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {/* Chat Tab */}
                        {sidebarTab === 'chat' && (
                            <div className="h-full flex flex-col bg-white">
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.map(msg => (
                                        <div key={msg.id} className={`flex flex-col ${msg.sender === currentUser?.name ? 'items-end' : 'items-start'}`}>
                                            <div className="flex items-baseline gap-2 mb-1">
                                                <span className="text-xs font-bold text-slate-600">{msg.sender}</span>
                                                <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                                            </div>
                                            <div className={`group px-4 py-2.5 rounded-2xl max-w-[85%] text-sm rounded-tr-sm flex gap-3 items-center ${msg.sender === currentUser?.name ? 'bg-bridgeable-blue text-white rounded-tr-sm rounded-tl-2xl' : 'bg-slate-100 text-slate-800 rounded-tl-sm rounded-tr-2xl'}`}>
                                                <span>{msg.text}</span>
                                                {/* TTS Button */}
                                                <button onClick={() => playTTS(msg.text)} className={`p-1.5 shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${msg.sender === currentUser?.name ? 'hover:bg-blue-600' : 'hover:bg-slate-200'}`}>
                                                    <Play size={14} className={msg.sender === currentUser?.name ? 'text-white' : 'text-slate-500'} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-slate-200 bg-slate-50">
                                    <form onSubmit={sendChatMessage} className="flex flex-col gap-2 relative">
                                        <div className="relative flex items-center">
                                            <input
                                                type="text"
                                                value={chatInput}
                                                onChange={(e) => setChatInput(e.target.value)}
                                                placeholder={isListening ? "Listening..." : "Type a message..."}
                                                className="w-full bg-white border border-slate-300 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-bridgeable-blue focus:ring-1 focus:ring-bridgeable-blue transition-all"
                                            />
                                            {/* STT Dictation Button */}
                                            <button type="button" onClick={toggleDictation} className={`absolute right-12 p-2 rounded-lg transition-colors ${isListening ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-bridgeable-blue'}`} title="Speech to text">
                                                <Mic size={18} />
                                            </button>
                                            <button type="submit" disabled={!chatInput.trim()} className="absolute right-2 p-2 text-bridgeable-blue hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50">
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Participants Tab */}
                        {sidebarTab === 'participants' && (
                            <div className="p-4 space-y-2 overflow-y-auto h-full">
                                {participants.map(p => (
                                    <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm relative">
                                                {p.name.charAt(0).toUpperCase()}
                                                {p.isSpeaking && <div className="absolute -inset-1 rounded-full border-2 border-bridgeable-blue animate-ping"></div>}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-800">{p.name} {p.isMe && '(You)'}</p>
                                                <p className="text-xs text-slate-500">{p.isSpeaking ? 'Speaking...' : 'Listening'}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 text-slate-400">
                                            {p.isMuted ? <MicOff size={16} className="text-red-500" /> : <Mic size={16} className="text-slate-700" />}
                                            {!p.isCameraOn && <CameraOff size={16} />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Accessibility Settings Tab */}
                        {sidebarTab === 'access' && (
                            <div className="p-6 space-y-6 overflow-y-auto h-full">
                                <h3 className="font-bold text-slate-800">Accessibility Preferences</h3>

                                <label className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-700 mb-1">Live Captions</p>
                                        <p className="text-xs text-slate-500 max-w-[200px]">Overlay transcribed speech onto the video area.</p>
                                    </div>
                                    <input type="checkbox" checked={showCaptions} onChange={() => setShowCaptions(!showCaptions)} className="w-5 h-5 accent-bridgeable-blue" />
                                </label>

                                <label className="flex items-center justify-between">
                                    <div className="text-sm">
                                        <p className="font-bold text-slate-700 mb-1">Sign Language Assistance</p>
                                        <p className="text-xs text-slate-500 max-w-[200px]">Open the gesture recognition panel.</p>
                                    </div>
                                    <input type="checkbox" checked={showSignPanel} onChange={() => setShowSignPanel(!showSignPanel)} className="w-5 h-5 accent-bridgeable-teal" />
                                </label>

                                <div className="border-t border-slate-200 pt-6 space-y-6">
                                    <label className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-700 mb-1">High Contrast Mode</p>
                                            <p className="text-xs text-slate-500">Increase contrast of interface elements.</p>
                                        </div>
                                        <input type="checkbox" checked={highContrast} onChange={() => setHighContrast(!highContrast)} className="w-5 h-5 accent-bridgeable-blue" />
                                    </label>

                                    <label className="flex items-center justify-between">
                                        <div className="text-sm">
                                            <p className="font-bold text-slate-700 mb-1">Large Text</p>
                                            <p className="text-xs text-slate-500">Increase size of chat and captions.</p>
                                        </div>
                                        <input type="checkbox" checked={largeText} onChange={() => setLargeText(!largeText)} className="w-5 h-5 accent-bridgeable-blue" />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sign Language Floating Modal / Panel */}
                {showSignPanel && (
                    <div className="absolute top-4 right-4 sm:right-auto sm:left-4 z-40 bg-white rounded-3xl border border-slate-200 p-4 shadow-2xl w-[320px] max-w-[calc(100vw-32px)] flex flex-col transition-all">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-bridgeable-navy text-sm flex items-center gap-2"><Ear size={16} className="text-bridgeable-teal" /> Sign Translator</h3>
                            <button onClick={() => toggleSignPanel()} className="text-slate-400 hover:text-slate-800"><X size={16} /></button>
                        </div>

                        <div className="aspect-video bg-slate-900 rounded-xl mb-3 relative overflow-hidden flex items-center justify-center">
                            {!signCameraActive ? (
                                <button onClick={startSignCamera} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 font-semibold shadow-sm border border-slate-700">
                                    Turn On Preview
                                </button>
                            ) : (
                                <video ref={signVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                            )}

                            {signCameraActive && (
                                <button onClick={stopSignCamera} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-md hover:bg-red-500 transition-colors backdrop-blur-sm">
                                    <CameraOff size={14} />
                                </button>
                            )}
                        </div>

                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2 min-h-[80px] relative">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest absolute top-2 right-3">Detected</span>
                            <div className="mt-4 flex-1 text-slate-800 font-medium text-sm">
                                {detectedSign ? <span className={detectedSign === 'Processing gestures...' ? 'text-slate-400 italic' : 'text-bridgeable-teal'}>{detectedSign}</span> : <span className="text-slate-400">Waiting for gestures...</span>}
                            </div>
                        </div>

                        <button
                            onClick={sendSignMessage}
                            disabled={!detectedSign || detectedSign === 'Processing gestures...'}
                            className="w-full mt-3 py-2.5 bg-bridgeable-teal hover:bg-teal-700 disabled:opacity-50 disabled:bg-slate-300 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <Send size={16} /> Send to Chat
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MeetingRoom;
