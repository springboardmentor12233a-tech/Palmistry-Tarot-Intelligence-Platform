import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Hand, Sparkles, User, Settings as SettingsIcon, LogOut, Menu, X, FileText, BookOpen, Home } from 'lucide-react';
import DoorLockAnimation from '../auth/DoorLockAnimation';

const UserNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = () => {
    if (window.confirm("Leave your reading journey?")) {
      setLoggingOut(true);
      setMobileMenuOpen(false);
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }, 4500);
    }
  };

  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Palm Reading', path: '/palm-reading', icon: Hand },
    { name: 'Tarot', path: '/tarot', icon: Sparkles },
    { name: 'My Readings', path: '/history', icon: BookOpen },
    { name: 'Reports', path: '/reports', icon: FileText },
  ];

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
            <DoorLockAnimation userName={user?.full_name || user?.email?.split('@')[0]} role={user?.role} />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050b14]/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] border-b border-blue-900/30' : 'bg-transparent py-2'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30 border border-blue-500/30 group-hover:border-cyan-400/50 transition-colors">
                <Hand size={16} className="text-cyan-400 absolute" />
                <Sparkles size={10} className="text-gold-400 absolute -top-1 -right-1" />
              </div>
              <span className="font-bold text-lg tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                AI Palmistry & Tarot
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} className="relative px-3 py-2 group">
                  <span className={`text-sm font-medium transition-colors ${location.pathname === item.path ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                    {item.name}
                  </span>
                  {location.pathname === item.path && (
                    <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.6)]" />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Profile & Logout */}
            <div className="hidden md:flex items-center space-x-4">
              {user.role === 'Admin' && (
                <Link to="/admin-dashboard" className="px-3 py-1 bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-pink-500/20 transition">
                  Admin Panel
                </Link>
              )}
              <Link to="/profile" className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
                <User size={18} className="group-hover:text-cyan-400" />
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition group" title="Logout">
                <LogOut size={18} />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 hover:text-white focus:outline-none">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-0 z-40 bg-[#050b14] flex flex-col pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col space-y-2 flex-grow">
              {navItems.map((item) => (
                <Link key={item.name} to={item.path} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-4 p-4 rounded-xl transition ${location.pathname === item.path ? 'bg-blue-900/20 text-white border border-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}>
                  <item.icon size={20} className={location.pathname === item.path ? 'text-cyan-400' : ''} />
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
              <div className="h-px w-full bg-gray-800 my-4" />
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-gray-400 hover:bg-white/5 transition">
                <User size={20} /> <span className="font-semibold">Profile</span>
              </Link>
              <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-gray-400 hover:bg-white/5 transition">
                <SettingsIcon size={20} /> <span className="font-semibold">Settings</span>
              </Link>
              {user.role === 'Admin' && (
                <Link to="/admin-dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 p-4 rounded-xl text-pink-400 bg-pink-500/10 hover:bg-pink-500/20 transition border border-pink-500/20 mt-2">
                  <span className="font-semibold uppercase tracking-wider">Admin Panel</span>
                </Link>
              )}
            </div>
            <div className="pb-8">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-900/20 text-red-400 font-bold hover:bg-red-900/40 transition">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserNavbar;
