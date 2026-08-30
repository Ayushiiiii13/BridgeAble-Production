import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Video, 
  PlusCircle, 
  Hand, 
  Subtitles, 
  Volume2, 
  Mic, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  Sliders, 
  Eye, 
  HeartHandshake,
  Laptop
} from 'lucide-react';
import Navbar from '../components/Navbar';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F7F1E8] text-[#2F261F] flex flex-col selection:bg-[#EADCC8] selection:text-[#5A3E2B]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#EADCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#EADCC8] text-[#5A3E2B] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#DCC8AE] shadow-warm-sm">
              <Sparkles className="w-4 h-4 text-[#A67C52]" />
              Accessibility-First Video Conferencing
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[#5A3E2B] leading-[1.1] brand-font">
              MEET WITHOUT <br />
              <span className="text-[#A67C52] underline decoration-[#DCC8AE] decoration-wavy">BARRIERS.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#7D7167] font-normal leading-relaxed max-w-2xl mx-auto">
              An accessible meeting platform designed from the ground up for deaf, non-speaking, and hearing participants to communicate, connect, and collaborate together.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/meetings/create"
                className="w-full sm:w-auto bg-[#5A3E2B] hover:bg-[#422D1F] text-[#FBF8F3] text-base font-semibold px-8 py-4 rounded-2xl shadow-warm-lg hover:shadow-warm-xl transition flex items-center justify-center gap-3 group"
              >
                <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Create a Meeting</span>
              </Link>

              <Link
                to="/meetings/join"
                className="w-full sm:w-auto bg-[#FBF8F3] hover:bg-[#EADCC8] text-[#5A3E2B] border-2 border-[#DCC8AE] text-base font-semibold px-8 py-4 rounded-2xl shadow-warm hover:shadow-warm-lg transition flex items-center justify-center gap-3"
              >
                <Video className="w-5 h-5" />
                <span>Join a Meeting</span>
              </Link>
            </div>
          </div>

          {/* Realistic BridgeAble Meeting Room Interface Visual */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="bg-[#2F261F] p-4 sm:p-6 rounded-3xl border-4 border-[#5A3E2B] shadow-warm-xl overflow-hidden relative">
              {/* Meeting Header Mock */}
              <div className="flex items-center justify-between pb-4 border-b border-[#5A3E2B] text-[#EADCC8] text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="font-bold text-sm text-[#FBF8F3]">Accessibility Design Sprint</span>
                  <span className="bg-[#5A3E2B] px-2 py-0.5 rounded text-[11px] font-mono text-[#DCC8AE]">BRG-82K4-XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-beige">4 Participants</span>
                </div>
              </div>

              {/* 4 Video Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                {/* Card 1: Ayushi (Signing) */}
                <div className="relative bg-[#422D1F] aspect-video rounded-2xl overflow-hidden border-2 border-amber-500/80 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-amber-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                      <Hand className="w-3.5 h-3.5" /> Sign Language Active
                    </span>
                    <span className="bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">98% Match</span>
                  </div>
                  
                  <div className="flex items-center justify-center my-auto">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-[#7A5A42] flex items-center justify-center text-2xl font-bold text-white shadow-inner mb-1 border border-amber-400">
                        🤟
                      </div>
                      <span className="text-xs text-amber-200 font-semibold bg-black/40 px-2 py-0.5 rounded">Gesture: "HELLO"</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-black/60 backdrop-blur-sm p-2 rounded-xl text-white text-xs">
                    <span className="font-semibold">Ayushi Sharma (You)</span>
                    <div className="flex gap-1.5 text-emerald-400">
                      <Mic className="w-3.5 h-3.5" />
                      <Video className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Rahul (Speaking) */}
                <div className="relative bg-[#422D1F] aspect-video rounded-2xl overflow-hidden border-2 border-emerald-500 p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" /> Speaking
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-auto">
                    <div className="w-16 h-16 rounded-full bg-[#5A3E2B] flex items-center justify-center text-2xl font-bold text-white border border-[#DCC8AE]">
                      R
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-black/60 backdrop-blur-sm p-2 rounded-xl text-white text-xs">
                    <span className="font-semibold">Rahul Verma</span>
                    <div className="flex gap-1.5 text-emerald-400">
                      <Mic className="w-3.5 h-3.5" />
                      <Video className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                {/* Card 3: Priya */}
                <div className="relative bg-[#422D1F] aspect-video rounded-2xl overflow-hidden border border-[#5A3E2B] p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#2F261F] text-[#DCC8AE] text-[11px] px-2 py-0.5 rounded-md">
                      Deaf / ASL
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-auto">
                    <div className="w-16 h-16 rounded-full bg-[#7A5A42] flex items-center justify-center text-2xl font-bold text-white border border-[#DCC8AE]">
                      P
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-black/60 backdrop-blur-sm p-2 rounded-xl text-white text-xs">
                    <span className="font-semibold">Priya Patel</span>
                    <div className="flex gap-1.5">
                      <span className="text-rose-400 text-xs">Muted</span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Arjun */}
                <div className="relative bg-[#422D1F] aspect-video rounded-2xl overflow-hidden border border-[#5A3E2B] p-3 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="bg-[#2F261F] text-[#DCC8AE] text-[11px] px-2 py-0.5 rounded-md">
                      Non-Speaking
                    </span>
                  </div>

                  <div className="flex items-center justify-center my-auto">
                    <div className="w-16 h-16 rounded-full bg-[#5A3E2B] flex items-center justify-center text-2xl font-bold text-white border border-[#DCC8AE]">
                      A
                    </div>
                  </div>

                  <div className="flex justify-between items-center bg-black/60 backdrop-blur-sm p-2 rounded-xl text-white text-xs">
                    <span className="font-semibold">Arjun Mehta</span>
                    <span className="text-emerald-400 text-xs">TTS Active</span>
                  </div>
                </div>
              </div>

              {/* Live Caption Overlay Preview */}
              <div className="bg-[#1C1713] border-2 border-[#A67C52] p-3.5 rounded-2xl text-white text-sm flex items-center justify-between shadow-lg">
                <div className="flex items-center gap-3">
                  <Subtitles className="w-5 h-5 text-amber-400 shrink-0" />
                  <p>
                    <span className="font-bold text-amber-300 mr-2">Rahul:</span>
                    "Let's review the new feature designs for inclusive meetings."
                  </p>
                </div>
                <span className="text-[10px] bg-[#5A3E2B] px-2 py-1 rounded text-[#EADCC8] font-mono">
                  LIVE
                </span>
              </div>

              {/* Bottom Meeting Controls Bar */}
              <div className="mt-4 pt-3 border-t border-[#5A3E2B] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="bg-[#5A3E2B] text-white p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Mute</span>
                  </div>
                  <div className="bg-[#5A3E2B] text-white p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold">
                    <Video className="w-4 h-4 text-emerald-400" />
                    <span>Stop Video</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-amber-800 text-white px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold">
                    <Hand className="w-4 h-4" />
                    <span>Sign Assistant</span>
                  </div>
                  <div className="bg-[#5A3E2B] text-white px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold">
                    <Subtitles className="w-4 h-4 text-amber-300" />
                    <span>Captions</span>
                  </div>
                  <div className="bg-[#5A3E2B] text-white px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold">
                    <Volume2 className="w-4 h-4" />
                    <span>TTS</span>
                  </div>
                </div>

                <div className="bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold">
                  Leave
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why BridgeAble Section */}
      <section className="py-20 bg-[#FBF8F3] border-b border-[#EADCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5A3E2B] brand-font">
              Why Traditional Video Tools Fall Short
            </h2>
            <p className="text-[#7D7167] text-base sm:text-lg">
              Generic platforms treat accessibility as an afterthought. BridgeAble weaves real-time assistive intelligence directly into the core meeting canvas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-interactive flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center mb-4">
                  <Hand className="w-6 h-6 text-[#5A3E2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#5A3E2B] mb-2">For Deaf & Hard of Hearing</h3>
                <p className="text-sm text-[#7D7167] leading-relaxed">
                  Real-time high-contrast live captions, visual speaking indicators, and integrated AI sign-language detection right inside your video grid.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EADCC8] text-xs font-semibold text-[#5A3E2B] flex items-center gap-1">
                <span>Integrated MediaPipe AI</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="card-interactive flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center mb-4">
                  <Volume2 className="w-6 h-6 text-[#5A3E2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#5A3E2B] mb-2">For Non-Speaking & Mute Users</h3>
                <p className="text-sm text-[#7D7167] leading-relaxed">
                  Natural Text-To-Speech audio synthesis with pre-saved phrases, custom typed voice output, and instant transcription distribution.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EADCC8] text-xs font-semibold text-[#5A3E2B] flex items-center gap-1">
                <span>Native Speech Synthesis</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="card-interactive flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center mb-4">
                  <HeartHandshake className="w-6 h-6 text-[#5A3E2B]" />
                </div>
                <h3 className="text-xl font-bold text-[#5A3E2B] mb-2">For Inclusive Teams</h3>
                <p className="text-sm text-[#7D7167] leading-relaxed">
                  Unified transcripts combining voice, sign gestures, and chat logs so no teammate is left out of decisions and discussions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EADCC8] text-xs font-semibold text-[#5A3E2B] flex items-center gap-1">
                <span>Universal Multi-Modal Logs</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-[#F7F1E8] border-b border-[#EADCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A67C52]">Complete Feature Suite</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5A3E2B] brand-font">
              Built For Seamless Collaborative Participation
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Accessible Video Calls', desc: 'High-definition WebRTC video streams with responsive multi-grid layouts.', icon: Video },
              { title: 'Live Speech Captions', desc: 'Real-time speech-to-text with adjustable font sizes and high-contrast modes.', icon: Subtitles },
              { title: 'Sign Language AI', desc: 'MediaPipe hand landmark detection with gesture classification.', icon: Hand },
              { title: 'Text-to-Speech Engine', desc: 'Voice synthesizer allowing non-speaking users to talk out loud in meetings.', icon: Volume2 },
              { title: 'Speech-to-Text Transcripts', desc: 'Automatic transcription saved to meeting history and downloadable notes.', icon: Mic },
              { title: 'Screen Sharing', desc: 'Collaborate with crisp presentation sharing and simultaneous caption overlays.', icon: Laptop },
              { title: 'Accessible Real-Time Chat', desc: 'Chat timeline supporting sign broadcasts, voice clips, and text messages.', icon: MessageSquare },
              { title: 'Personalized Preferences', desc: 'Custom contrast, motion, text sizes, and font preferences that persist.', icon: Sliders },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="card-warm p-5 hover:border-[#A67C52] transition">
                  <div className="w-10 h-10 rounded-xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-[#5A3E2B] text-base mb-1.5">{f.title}</h4>
                  <p className="text-xs text-[#7D7167] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-[#FBF8F3] border-b border-[#EADCC8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#A67C52]">Effortless Onboarding</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#5A3E2B] brand-font">
              How BridgeAble Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card-warm text-center p-8">
              <div className="w-12 h-12 rounded-full bg-[#5A3E2B] text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-[#5A3E2B] mb-2">Create or Join</h3>
              <p className="text-sm text-[#7D7167]">
                Generate a unique meeting code in seconds (e.g. BRG-82K4-XP) or enter a share link.
              </p>
            </div>

            <div className="card-warm text-center p-8">
              <div className="w-12 h-12 rounded-full bg-[#5A3E2B] text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-[#5A3E2B] mb-2">Pre-Join Customization</h3>
              <p className="text-sm text-[#7D7167]">
                Set up your camera, test your microphone, and pick your preferred accessibility features.
              </p>
            </div>

            <div className="card-warm text-center p-8">
              <div className="w-12 h-12 rounded-full bg-[#5A3E2B] text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-[#5A3E2B] mb-2">Meet & Communicate</h3>
              <p className="text-sm text-[#7D7167]">
                Enjoy live captions, AI sign recognition, voice synthesis, and multi-modal transcripts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#5A3E2B] to-[#422D1F] text-[#FBF8F3] text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#FBF8F3] brand-font">
            Ready to experience barrier-free meetings?
          </h2>
          <p className="text-[#EADCC8] text-lg max-w-2xl mx-auto">
            Join thousands of users communicating seamlessly with integrated sign recognition, live captions, and speech synthesis.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="bg-[#EADCC8] hover:bg-[#FBF8F3] text-[#5A3E2B] font-bold px-8 py-4 rounded-2xl shadow-warm-lg transition text-base"
            >
              Get Started for Free
            </Link>
            <Link
              to="/meetings/join"
              className="bg-transparent hover:bg-white/10 text-white border border-[#EADCC8] font-bold px-8 py-4 rounded-2xl transition text-base"
            >
              Enter Meeting Code
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F261F] text-[#DCC8AE] py-12 border-t border-[#5A3E2B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#EADCC8] text-[#5A3E2B] flex items-center justify-center font-bold">
              B
            </div>
            <span className="text-lg font-bold text-white brand-font">BridgeAble</span>
            <span className="text-xs text-[#A67C52]">| Meet Without Barriers</span>
          </div>

          <div className="flex items-center gap-6 text-xs font-medium text-[#CDB494]">
            <Link to="/meetings" className="hover:text-white transition">Meetings</Link>
            <Link to="/settings" className="hover:text-white transition">Accessibility</Link>
            <Link to="/calendar" className="hover:text-white transition">Calendar</Link>
            <Link to="/history" className="hover:text-white transition">Transcripts</Link>
          </div>

          <p className="text-xs text-[#7D7167]">
            &copy; {new Date().getFullYear()} BridgeAble Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
