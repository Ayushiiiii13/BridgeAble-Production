import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Video, 
  PlusCircle, 
  Calendar, 
  Users, 
  History, 
  Sliders, 
  User, 
  FileText
} from 'lucide-react';

const Sidebar = () => {
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/meetings', label: 'Meetings', icon: Video },
    { to: '/meetings/create', label: 'Schedule Meeting', icon: PlusCircle },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/contacts', label: 'Contacts', icon: Users },
    { to: '/history', label: 'History & Transcripts', icon: History },
    { to: '/settings', label: 'Accessibility', icon: Sliders },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-[#FBF8F3] border-r border-[#EADCC8] flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="space-y-1">
        <p className="px-3 text-xs font-semibold text-[#7D7167] uppercase tracking-wider mb-2">
          Navigation
        </p>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#5A3E2B] text-[#FBF8F3] shadow-warm-sm font-semibold'
                    : 'text-[#2F261F] hover:bg-[#EADCC8]/60 hover:text-[#5A3E2B]'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-[#EADCC8]">
        <div className="bg-[#F7F1E8] border border-[#EADCC8] rounded-xl p-3.5 text-xs text-[#7D7167]">
          <div className="flex items-center gap-2 text-[#5A3E2B] font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Accessibility Active
          </div>
          <p>Live Captions, Speech Synthesis & Sign Recognition are ready.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
