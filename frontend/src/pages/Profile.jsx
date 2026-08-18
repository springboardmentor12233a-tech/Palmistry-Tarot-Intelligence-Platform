import React, { useState, useEffect } from 'react';
import { User, Calendar, Award, Star, Settings, X, Key, Save } from 'lucide-react';
import { getReadings } from '../services/readingService';
import { updateProfile, changePassword } from '../services/authService';

const Profile = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({ full_name: user.full_name || '', spiritual_goals: user.spiritual_goals || '' });
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    getReadings().then(res => { setReadings(res.data); setLoading(false); }).catch(e => setLoading(false));
  }, []);

  const stats = {
    palm: readings.filter(r => r.reading_type === 'palm' || r.reading_type === 'combined').length,
    tarot: readings.filter(r => r.reading_type === 'tarot' || r.reading_type === 'combined').length,
    combined: readings.filter(r => r.reading_type === 'combined').length,
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await updateProfile(profileForm);
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => { setIsEditProfileOpen(false); setSuccessMsg(''); }, 1500);
    } catch (err) {
      setErrorMsg('Failed to update profile.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMsg('New passwords do not match.');
      return;
    }
    try {
      await changePassword({ old_password: passwordForm.old_password, new_password: passwordForm.new_password });
      setSuccessMsg('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      setTimeout(() => { setIsChangePasswordOpen(false); setSuccessMsg(''); }, 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.old_password?.[0] || 'Failed to change password.');
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-12">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Your Profile</h1>
        </div>

        <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5">
             <Settings size={150} />
           </div>
           
           <div className="relative z-10">
             <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-1">
               <div className="w-full h-full rounded-full bg-[#050b14] flex items-center justify-center border-4 border-[#050b14]">
                 <User size={48} className="text-gray-400" />
               </div>
             </div>
           </div>
           <div className="flex-1 text-center md:text-left z-10">
             <h2 className="text-2xl font-bold text-white mb-2">{user.full_name || user.username || 'Explorer'}</h2>
             <p className="text-gray-400 mb-2">{user.email}</p>
             {user.spiritual_goals && (
               <p className="text-purple-400 text-sm mb-4 italic">Goals: {user.spiritual_goals}</p>
             )}
             <p className="text-gray-500 mb-6 flex items-center justify-center md:justify-start gap-2 text-sm">
               <Calendar size={14} /> Joined Recently
             </p>
             <div className="flex gap-4 justify-center md:justify-start">
               <button onClick={() => setIsEditProfileOpen(true)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition font-medium text-sm flex items-center gap-2">
                 <Settings size={16} /> Edit Profile
               </button>
               <button onClick={() => setIsChangePasswordOpen(true)} className="px-6 py-2 bg-purple-900/40 hover:bg-purple-800/60 text-purple-300 border border-purple-500/30 rounded-lg transition font-medium text-sm flex items-center gap-2">
                 <Key size={16} /> Change Password
               </button>
             </div>
           </div>
        </div>

        <h3 className="text-xl font-bold text-white pl-4">Your Spiritual Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-[#0a1128]/80 border border-gray-800 p-6 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-cyan-900/30 flex items-center justify-center text-cyan-400"><Award size={24}/></div>
             <div>
               <p className="text-3xl font-bold text-white">{loading ? '-' : stats.palm}</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Palm Readings</p>
             </div>
           </div>
           <div className="bg-[#0a1128]/80 border border-gray-800 p-6 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-purple-900/30 flex items-center justify-center text-purple-400"><Star size={24}/></div>
             <div>
               <p className="text-3xl font-bold text-white">{loading ? '-' : stats.tarot}</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Tarot Readings</p>
             </div>
           </div>
           <div className="bg-[#0a1128]/80 border border-gray-800 p-6 rounded-2xl flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-pink-900/30 flex items-center justify-center text-pink-400"><User size={24}/></div>
             <div>
               <p className="text-3xl font-bold text-white">{loading ? '-' : stats.combined}</p>
               <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Combined Insights</p>
             </div>
           </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1128] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsEditProfileOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
            {errorMsg && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{errorMsg}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">{successMsg}</div>}
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Full Name</label>
                <input type="text" value={profileForm.full_name} onChange={(e) => setProfileForm({...profileForm, full_name: e.target.value})} className="w-full bg-[#050b14] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Spiritual Goals</label>
                <textarea value={profileForm.spiritual_goals} onChange={(e) => setProfileForm({...profileForm, spiritual_goals: e.target.value})} className="w-full bg-[#050b14] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" rows="3" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 font-bold flex items-center justify-center gap-2">
                <Save size={18} /> Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a1128] border border-gray-800 rounded-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setIsChangePasswordOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-bold text-white mb-6">Change Password</h2>
            {errorMsg && <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{errorMsg}</div>}
            {successMsg && <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4 text-sm">{successMsg}</div>}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Current Password</label>
                <input type="password" value={passwordForm.old_password} onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})} required className="w-full bg-[#050b14] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">New Password</label>
                <input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} required className="w-full bg-[#050b14] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Confirm New Password</label>
                <input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})} required className="w-full bg-[#050b14] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500" />
              </div>
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-3 font-bold flex items-center justify-center gap-2">
                <Key size={18} /> Update Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
