import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import CosmicAuthBackground from '../components/auth/CosmicAuthBackground';
import LoginPalmScanner from '../components/auth/LoginPalmScanner';
import DoorUnlockAnimation from '../components/auth/DoorUnlockAnimation';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userName, setUserName] = useState('');
  
  const [focusedInput, setFocusedInput] = useState(null);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setUserName(response.data.user.full_name || response.data.user.email.split('@')[0]);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 7000); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  };

  return (
    <motion.div 
      key="login-page"
      initial="hidden" animate="visible" exit="exit"
      className="relative min-h-screen flex text-gray-100 overflow-hidden"
    >
      <CosmicAuthBackground mode="login" />

      {/* Two column layout */}
      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Visual Area */}
        <div className="hidden md:flex md:w-[55%] flex-col items-center justify-center p-8 border-r border-gray-800/30">
          <LoginPalmScanner />
        </div>

        {/* Right Form Area */}
        <div className="w-full md:w-[45%] flex items-center justify-center p-6 sm:p-12">
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div 
                key="form-container"
                variants={containerVariants}
                initial="hidden"
                animate={error ? "visible" : "visible"}
                className="w-full max-w-md bg-[#0f0c1e]/70 backdrop-blur-xl p-10 rounded-[24px] border border-blue-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></motion.div>
                    <span className="text-[10px] tracking-[0.2em] text-cyan-400/80 font-bold">AI READING ENGINE READY</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                    Welcome Back
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">Continue your journey of discovery.</p>
                </motion.div>

                {error && (
                  <motion.div animate={shakeAnimation} className="mb-6 p-3 rounded bg-red-900/30 border border-red-500/50 text-red-200 text-sm text-center shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                    {error}
                  </motion.div>
                )}
                
                <motion.form variants={containerVariants} onSubmit={handleLogin} className="flex flex-col gap-6">
                  
                  {/* Email */}
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedInput === 'email' || email ? '-top-2.5 text-[10px] uppercase font-bold bg-[#0f0c1e] px-2 text-cyan-400' : 'top-3.5 text-sm text-gray-500'}`}>
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className={`w-full p-3.5 bg-gray-900/50 border rounded-xl text-white outline-none transition-all duration-300 ${focusedInput === 'email' ? 'border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.2)]' : error ? 'border-red-500/50' : 'border-gray-700/50'}`} 
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedInput === 'password' || password ? '-top-2.5 text-[10px] uppercase font-bold bg-[#0f0c1e] px-2 text-blue-400' : 'top-3.5 text-sm text-gray-500'}`}>
                      Password
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      required
                      className={`w-full p-3.5 bg-gray-900/50 border rounded-xl text-white outline-none transition-all duration-300 ${focusedInput === 'password' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : error ? 'border-red-500/50' : 'border-gray-700/50'}`} 
                    />
                  </motion.div>

                  {/* Options */}
                  <motion.div variants={itemVariants} className="flex justify-between items-center text-xs text-gray-400">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" className="rounded bg-gray-800 border-gray-600 text-cyan-500 focus:ring-cyan-500" />
                      Remember me
                    </label>
                    <button type="button" className="hover:text-cyan-400 transition-colors">Forgot Password?</button>
                  </motion.div>

                  {/* Submit */}
                  <motion.div variants={itemVariants}>
                    <motion.button 
                      whileHover={{ scale: 1.02, y: -1, boxShadow: "0px 5px 20px rgba(34,211,238,0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      type="submit" 
                      disabled={loading}
                      className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl font-bold transition flex items-center justify-center gap-2 relative overflow-hidden"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Signing In...
                        </>
                      ) : 'SIGN IN'}
                    </motion.button>
                  </motion.div>

                </motion.form>

                <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-gray-400 border-t border-gray-800 pt-6">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
                    Create Account
                  </Link>
                </motion.div>
                
              </motion.div>
            ) : (
              // Success State - Door Animation
              <motion.div
                key="success-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 w-screen h-screen bg-[#050b14] flex items-center justify-center"
              >
                <DoorUnlockAnimation userName={userName} role="User" />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
};

export default Login;
