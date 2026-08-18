import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Hand, ScanFace, BrainCircuit, 
  Activity, FileText, ShieldAlert, ActivitySquare, Settings, 
  Menu, X, Search, Bell, ChevronLeft, LogOut
} from 'lucide-react';
import DoorLockAnimation from '../auth/DoorLockAnimation';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/admin/login');
    }, 4500);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'palm', label: 'Palm Readings', icon: Hand },
    { id: 'tarot', label: 'Tarot Readings', icon: ScanFace },
    { id: 'insights', label: 'AI Insights', icon: BrainCircuit },
    { id: 'tracking', label: 'User Tracking', icon: Activity },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'overrides', label: 'Overrides', icon: ShieldAlert },
    { id: 'monitoring', label: 'Engine Monitoring', icon: ActivitySquare },
    { id: 'settings', label: 'System Settings', icon: Settings },
  ];

  // Helper to determine active tab based on query param or default
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'dashboard';

  const navigateTab = (id) => {
    navigate(`/admin-dashboard?tab=${id}`);
  };

  return (
    <>
      <AnimatePresence>
        {loggingOut && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] w-screen h-screen bg-[#050b14] flex items-center justify-center"
          >
            <DoorLockAnimation userName={user?.full_name || user?.email?.split('@')[0] || 'Administrator'} role={user?.role || 'Admin'} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="min-h-screen bg-[#080B14] text-gray-200 flex overflow-hidden selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 70 }}
        className="relative z-20 flex flex-col bg-[#0b0f1c] border-r border-blue-900/30 h-screen transition-all duration-300 ease-in-out shrink-0"
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900/30">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="font-bold tracking-wider text-sm bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 truncate">
                AI CONTROL CENTER
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 rounded-lg hover:bg-blue-900/30 text-blue-400 transition">
            {sidebarOpen ? <ChevronLeft size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigateTab(item.id)}
                className={`w-full flex items-center gap-3 p-3 mb-1 rounded-xl transition-all group relative overflow-hidden ${
                  isActive ? 'bg-blue-600/10 text-blue-400' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                {isActive && (
                  <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-r-full" />
                )}
                <Icon size={20} className={`shrink-0 ${isActive ? 'text-cyan-400 drop-shadow-[0_0_5px_#22d3ee]' : ''}`} />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span initial={{opacity: 0, x: -10}} animate={{opacity: 1, x: 0}} exit={{opacity: 0, x: -10}} className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </motion.aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 shrink-0 bg-[#0b0f1c]/80 backdrop-blur-md border-b border-blue-900/30 flex items-center justify-between px-6 z-10">
          
          {/* Global Search */}
          <div className="relative w-64 md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text" 
              placeholder="Search users, readings, reports..." 
              className="w-full bg-[#080B14] border border-blue-900/30 rounded-full py-1.5 pl-10 pr-4 text-sm text-gray-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder-gray-600"
            />
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-4">
            
            {/* System Health */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-900/10 border border-green-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs text-green-400 font-mono">ALL SYSTEMS NOMINAL</span>
            </div>

            <button onClick={() => navigate('/dashboard')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 rounded-lg text-xs font-bold text-blue-400 uppercase tracking-wider transition">
              User Portal
            </button>

            <button className="relative p-2 text-gray-400 hover:text-blue-400 transition">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full shadow-[0_0_5px_#ec4899]"></span>
            </button>

            <div className="h-6 w-px bg-blue-900/50 mx-2"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-200">{user.full_name || 'Administrator'}</p>
                <p className="text-[10px] text-blue-400 font-mono uppercase">{user.role}</p>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 transition" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children(currentTab)}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
    </>
  );
};

export default AdminLayout;
