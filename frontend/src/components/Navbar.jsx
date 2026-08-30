import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Video, 
  PlusCircle, 
  LogIn, 
  UserPlus, 
  Settings, 
  LogOut, 
  Eye, 
  Type
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const {
    user,
    isAuthenticated,
    logout,
    highContrast,
    toggleHighContrast,
    textSize,
    setTextSize
  } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isMeetingRoom = location.pathname.startsWith('/meeting/') && !location.pathname.includes('/prejoin');

  // Do not render default full navbar inside the active full-screen meeting room
  if (isMeetingRoom) return null;

  const cycleTextSize = () => {
    if (textSize === 'small') setTextSize('medium');
    else if (textSize === 'medium') setTextSize('large');
    else if (textSize === 'large') setTextSize('xlarge');
    else setTextSize('medium');
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FBF8F3]/90 backdrop-blur-md border-b border-[#EADCC8] shadow-warm-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-[#5A3E2B] flex items-center justify-center text-[#FBF8F3] shadow-warm-sm group-hover:bg-[#422D1F] transition-colors">
              <span className="font-bold text-xl tracking-tight brand-font">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#5A3E2B] tracking-tight brand-font">
                Bridge<span className="text-[#A67C52]">Able</span>
              </span>
              <span className="text-[10px] text-[#7D7167] tracking-wider uppercase font-semibold">
                Meet Without Barriers
              </span>
            </div>
          </Link>

          {/* Quick Accessibility Controls */}
          <div className="hidden md:flex items-center gap-2 bg-[#F7F1E8] px-3 py-1.5 rounded-xl border border-[#EADCC8]">
            <button
              type="button"
              onClick={toggleHighContrast}
              title="Toggle High Contrast Mode"
              aria-label="Toggle High Contrast Mode"
              aria-pressed={highContrast}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                highContrast
                  ? 'bg-[#5A3E2B] text-white'
                  : 'text-[#7D7167] hover:text-[#5A3E2B]'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>Contrast</span>
            </button>

            <button
              type="button"
              onClick={cycleTextSize}
              title={`Text Size: ${textSize.toUpperCase()} (Click to change)`}
              aria-label={`Cycle text size, current size is ${textSize}`}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                textSize !== 'medium'
                  ? 'bg-[#5A3E2B] text-white'
                  : 'text-[#7D7167] hover:text-[#5A3E2B]'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>Text ({textSize.toUpperCase()})</span>
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/meetings/create"
                  className="hidden sm:inline-flex items-center gap-2 bg-[#5A3E2B] hover:bg-[#422D1F] text-[#FBF8F3] px-4 py-2 rounded-xl text-sm font-medium transition shadow-warm-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Meeting</span>
                </Link>

                <Link
                  to="/meetings/join"
                  className="hidden sm:inline-flex items-center gap-2 bg-[#F7F1E8] hover:bg-[#EADCC8] text-[#5A3E2B] border border-[#DCC8AE] px-4 py-2 rounded-xl text-sm font-medium transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Join</span>
                </Link>

                <Link
                  to="/dashboard"
                  className="p-2 text-[#7D7167] hover:text-[#5A3E2B] rounded-xl hover:bg-[#F7F1E8] transition"
                  title="Dashboard"
                >
                  <span className="text-sm font-medium px-2">Dashboard</span>
                </Link>

                <Link
                  to="/settings"
                  className="p-2 text-[#7D7167] hover:text-[#5A3E2B] rounded-xl hover:bg-[#F7F1E8] transition"
                  title="Accessibility Settings"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                <div className="flex items-center gap-2 pl-2 border-l border-[#EADCC8]">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#F7F1E8] transition"
                    title="User Profile"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#EADCC8] text-[#5A3E2B] font-semibold flex items-center justify-center text-sm border border-[#DCC8AE]">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-medium text-[#2F261F] hidden lg:inline">
                      {user?.name || 'User'}
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="p-2 text-[#7D7167] hover:text-red-700 rounded-xl hover:bg-red-50 transition"
                    title="Log Out"
                    aria-label="Log Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5A3E2B] hover:text-[#422D1F] px-4 py-2 rounded-xl hover:bg-[#EADCC8]/50 transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 bg-[#5A3E2B] hover:bg-[#422D1F] text-[#FBF8F3] text-sm font-medium px-4 py-2 rounded-xl transition shadow-warm-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
