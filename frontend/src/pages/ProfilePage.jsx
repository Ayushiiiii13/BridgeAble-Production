import React, { useState } from 'react';
import { User, Mail, Shield, Sliders, CheckCircle2, Edit2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || 'Ayushi Sharma');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserProfile({ name });
    setIsEditing(false);
    setSavedMessage('Profile updated successfully!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A3E2B] brand-font">User Profile</h1>
        <p className="text-sm text-[#7D7167]">Manage your personal details and view your meeting activity</p>
      </div>

      {savedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="card-warm p-6 sm:p-8 space-y-6 shadow-warm-lg">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-[#5A3E2B] text-white text-3xl font-bold flex items-center justify-center border-4 border-[#EADCC8] shadow-warm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-2xl font-bold text-[#5A3E2B]">{user?.name || 'Ayushi Sharma'}</h2>
            <p className="text-sm text-[#7D7167] flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#A67C52]" />
              <span>{user?.email || 'ayushi@bridgeable.org'}</span>
            </p>
            <div className="pt-2">
              <span className="badge-beige font-semibold">Accessibility Champion</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 border-t border-[#EADCC8]">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#5A3E2B]">Account Details</h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3E2B] mb-1 uppercase tracking-wider">
              Display Name
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white border border-[#DCC8AE] rounded-xl p-2.5 text-sm text-[#2F261F] disabled:bg-gray-100 disabled:text-[#7D7167] focus:outline-none focus:border-[#5A3E2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#5A3E2B] mb-1 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              disabled
              value={user?.email || 'ayushi@bridgeable.org'}
              className="w-full bg-gray-100 border border-[#DCC8AE] rounded-xl p-2.5 text-sm text-[#7D7167]"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
