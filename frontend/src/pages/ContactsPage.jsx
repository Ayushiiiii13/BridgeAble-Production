import React, { useState } from 'react';
import { Users, Search, Video, MessageSquare, Plus, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContactsPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const contacts = [
    { id: 1, name: 'Rahul Verma', email: 'rahul@bridgeable.org', role: 'Hearing / Frontend Engineer', online: true },
    { id: 2, name: 'Priya Patel', email: 'priya@bridgeable.org', role: 'Deaf / ASL Specialist', online: true },
    { id: 3, name: 'Arjun Mehta', email: 'arjun@bridgeable.org', role: 'Non-Speaking / UX Designer', online: false },
    { id: 4, name: 'Ananya Sharma', email: 'ananya@bridgeable.org', role: 'Accessibility Product Manager', online: true },
    { id: 5, name: 'Devon Vance', email: 'devon@bridgeable.org', role: 'AI MediaPipe Researcher', online: false },
  ];

  const filtered = contacts.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">Contacts</h1>
          <p className="text-sm text-[#7D7167]">Connect and invite colleagues directly into accessible meetings</p>
        </div>

        <button className="btn-primary text-sm shadow-warm">
          <Plus className="w-4 h-4" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="card-warm p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-[#7D7167] absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts by name or role..."
            className="w-full bg-white border border-[#DCC8AE] rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-[#2F261F] focus:outline-none focus:border-[#5A3E2B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card-interactive p-5 flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-[#5A3E2B] text-white font-bold flex items-center justify-center text-sm shadow-warm-sm">
                  {c.name.charAt(0)}
                </div>
                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                  c.online ? 'bg-emerald-500' : 'bg-gray-300'
                }`} />
              </div>

              <div>
                <h3 className="font-bold text-sm text-[#2F261F]">{c.name}</h3>
                <p className="text-xs text-[#A67C52] font-medium">{c.role}</p>
                <p className="text-[11px] text-[#7D7167]">{c.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/meetings/create')}
                className="btn-primary text-xs py-2 px-3 shadow-warm-sm"
                title="Start a meeting with this contact"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Invite</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactsPage;
