import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import DoorUnlockAnimation from '../components/auth/DoorUnlockAnimation';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authPhase, setAuthPhase] = useState(0); // 0=idle, 1=authenticating, 2=verifying, 3=granted
  const [focusedInput, setFocusedInput] = useState(null);
  const [adminName, setAdminName] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAuthPhase(1); // AUTHENTICATING...
    
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      const user = response.data.user;
      if (user.role !== 'Admin') {
        throw new Error('Access Denied. Admin privileges required.');
      }

      setAuthPhase(2); // VERIFYING ADMIN PRIVILEGES...
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setTimeout(() => {
        setAuthPhase(3); // ACCESS GRANTED
        setAdminName(user.full_name || 'Administrator');
        setTimeout(() => navigate('/admin-dashboard'), 7000);
      }, 1500);

    } catch (err) {
      setAuthPhase(0);
      setError(err.response?.data?.detail || err.message || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen flex text-gray-100 overflow-hidden bg-[#030614]">
      
      {/* Security Cosmic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#030614] to-[#030614]"></div>
        
        {/* Security Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTYwIDBMMCAwTDAgNjBMMzAgNjBMMzAgMzBMNjAgMzBaIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMzAsIDU4LCAxMzgsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Visual: AI Security System */}
        <div className="hidden md:flex md:w-1/2 flex-col items-center justify-center p-8 border-r border-blue-900/30 bg-black/40 backdrop-blur-sm">
          <div className="relative w-[300px] h-[300px] flex items-center justify-center">
            
            {/* Outer Security Rings */}
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-[280px] h-[280px] rounded-full border border-dashed border-blue-500/30"></motion.div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[240px] h-[240px] rounded-full border border-blue-400/20"></motion.div>
            
            {/* Central Hologram Combo */}
            <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute w-24 h-24 bg-[url('/palm-silhouette.png')] bg-contain bg-center bg-no-repeat opacity-60"></motion.div>
            
            <motion.div 
              animate={{ rotateY: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute w-12 h-16 border border-blue-400/40 bg-blue-900/20 rounded shadow-[0_0_15px_rgba(59,130,246,0.3)] backdrop-blur-md flex items-center justify-center"
            >
              <div className="w-8 h-8 rounded-full border border-cyan-300/50 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
              </div>
            </motion.div>

            {/* Dynamic Status Display */}
            <div className="absolute bottom-[-60px] text-center">
              <p className="text-[10px] text-blue-400/80 font-mono tracking-[0.2em] uppercase">
                {authPhase === 0 ? "SECURE CHANNEL INITIALIZED" : 
                 authPhase === 1 ? "AUTHENTICATING..." : 
                 authPhase === 2 ? "VERIFYING ADMIN PRIVILEGES..." : 
                 "ACCESS GRANTED"}
              </p>
              {(authPhase > 0 && authPhase < 3) && (
                <div className="w-32 h-1 bg-gray-800 mx-auto mt-2 rounded overflow-hidden">
                  <motion.div className="h-full bg-blue-500" initial={{width: "0%"}} animate={{width: "100%"}} transition={{duration: 1.5}}></motion.div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Form Area */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12">
          <AnimatePresence mode="wait">
            {authPhase < 3 ? (
              <motion.div 
                key="admin-form"
                variants={containerVariants}
                initial="hidden" animate="visible" exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#080d20]/80 backdrop-blur-xl p-10 rounded-2xl border border-blue-500/20 shadow-[0_0_40px_rgba(30,58,138,0.3)]"
              >
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <div className="inline-block p-2 rounded-lg bg-blue-900/30 border border-blue-500/30 mb-4">
                    <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-wide">Admin Control Center</h2>
                  <p className="text-sm text-blue-300/60 mt-1">Secure access to the AI Palmistry & Tarot platform.</p>
                </motion.div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded bg-red-900/20 border border-red-500/30 text-red-400 text-sm text-center">
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleLogin} className="flex flex-col gap-6">
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-3 transition-all duration-200 pointer-events-none font-mono ${focusedInput === 'email' || email ? '-top-2.5 text-[10px] bg-[#080d20] px-1 text-blue-400' : 'top-3 text-sm text-gray-500'}`}>Admin Email</label>
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} required disabled={loading}
                      className={`w-full p-3 bg-transparent border rounded text-white outline-none font-mono text-sm transition-all duration-300 ${focusedInput === 'email' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-gray-700'}`} 
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-3 transition-all duration-200 pointer-events-none font-mono ${focusedInput === 'password' || password ? '-top-2.5 text-[10px] bg-[#080d20] px-1 text-blue-400' : 'top-3 text-sm text-gray-500'}`}>Password</label>
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} required disabled={loading}
                      className={`w-full p-3 bg-transparent border rounded text-white outline-none font-mono text-sm transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.2)]' : 'border-gray-700'}`} 
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="flex justify-between items-center text-xs text-gray-400 font-mono">
                    <label className="flex items-center gap-2 cursor-pointer hover:text-gray-300">
                      <input type="checkbox" className="rounded bg-gray-800 border-gray-600 text-blue-500 focus:ring-blue-500" disabled={loading} />
                      Remember this device
                    </label>
                    <button type="button" className="hover:text-blue-400 transition-colors">Forgot Password?</button>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.button 
                      whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} type="submit" disabled={loading}
                      className={`w-full py-3 bg-blue-600 hover:bg-blue-500 rounded font-bold font-mono tracking-widest text-sm transition flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'PROCESSING...' : 'SECURE SIGN IN'}
                    </motion.button>
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="mt-2 text-center">
                    <button 
                      type="button" 
                      onClick={() => navigate('/login')}
                      className="text-xs text-blue-400/70 hover:text-blue-300 font-mono tracking-wider transition-colors"
                    >
                      NOT AN ADMIN? ACCESS USER PORTAL →
                    </button>
                  </motion.div>
                </form>
              </motion.div>
            ) : (
              <motion.div 
                key="access-granted"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 w-screen h-screen bg-[#050b14] flex items-center justify-center"
              >
                <DoorUnlockAnimation userName={adminName} role="Admin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
