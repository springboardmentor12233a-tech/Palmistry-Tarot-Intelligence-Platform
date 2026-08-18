import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Eye, Shield, Palette } from 'lucide-react';

const Settings = () => {
  const [animations, setAnimations] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-gray-800 rounded-full mb-4">
            <SettingsIcon className="text-gray-400" size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Settings</h1>
        </div>

        <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 rounded-3xl overflow-hidden shadow-2xl">
           
           {/* Section */}
           <div className="p-6 md:p-8 border-b border-gray-800">
             <div className="flex items-center gap-3 mb-6">
               <Eye className="text-cyan-400" size={24} /> <h2 className="text-xl font-bold text-white">Appearance & Accessibility</h2>
             </div>
             <div className="flex items-center justify-between py-2">
               <div>
                 <p className="font-medium text-gray-200">Cinematic Animations</p>
                 <p className="text-sm text-gray-500">Enable smooth transitions and mystical effects.</p>
               </div>
               <button onClick={() => setAnimations(!animations)} className={`w-12 h-6 rounded-full transition-colors relative ${animations ? 'bg-cyan-500' : 'bg-gray-700'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${animations ? 'left-7' : 'left-1'}`}></div>
               </button>
             </div>
           </div>

           {/* Section */}
           <div className="p-6 md:p-8 border-b border-gray-800">
             <div className="flex items-center gap-3 mb-6">
               <Bell className="text-purple-400" size={24} /> <h2 className="text-xl font-bold text-white">Notifications</h2>
             </div>
             <div className="flex items-center justify-between py-2">
               <div>
                 <p className="font-medium text-gray-200">Reading Ready Alerts</p>
                 <p className="text-sm text-gray-500">Get notified when a deep AI synthesis is complete.</p>
               </div>
               <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-purple-500' : 'bg-gray-700'}`}>
                 <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${notifications ? 'left-7' : 'left-1'}`}></div>
               </button>
             </div>
           </div>

           {/* Section */}
           <div className="p-6 md:p-8">
             <div className="flex items-center gap-3 mb-6">
               <Shield className="text-pink-400" size={24} /> <h2 className="text-xl font-bold text-white">Privacy</h2>
             </div>
             <div className="space-y-4">
               <button className="w-full text-left py-3 px-4 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-800 transition">
                 Manage Reading History
               </button>
               <button className="w-full text-left py-3 px-4 rounded-xl bg-gray-900 border border-gray-800 text-red-400 hover:bg-red-900/30 hover:border-red-500/50 transition">
                 Delete Account Data
               </button>
             </div>
           </div>
           
        </div>
      </div>
    </div>
  );
};

export default Settings;
