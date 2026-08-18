import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import CosmicAuthBackground from '../components/auth/CosmicAuthBackground';
import RegisterTarotPortal from '../components/auth/RegisterTarotPortal';
import DoorUnlockAnimation from '../components/auth/DoorUnlockAnimation';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    role: 'User'
  });
  
  const [userName, setUserName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Weak', color: 'bg-red-500' });
  
  const navigate = useNavigate();

  useEffect(() => {
    const p = formData.password;
    let score = 0;
    if (p.length > 5) score += 1;
    if (p.length > 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    
    if (p.length === 0) setPasswordStrength({ score: 0, label: '', color: 'bg-transparent' });
    else if (score <= 2) setPasswordStrength({ score: 1, label: 'Weak', color: 'bg-red-500' });
    else if (score <= 4) setPasswordStrength({ score: 2, label: 'Medium', color: 'bg-yellow-400' });
    else setPasswordStrength({ score: 3, label: 'Strong', color: 'bg-green-500' });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.role === 'Admin' && formData.email !== 'admin@aipalmistry.com') {
      setError('You are not authorized to register as an Admin with this email.');
      return;
    }
    
    setLoading(true);
    try {
      const payload = { ...formData, spiritual_goals: 'Personal Growth' };
      delete payload.confirm_password;
      
      await api.post('/api/auth/register', payload);
      
      const loginRes = await api.post('/api/auth/login', { 
        email: formData.email, 
        password: formData.password 
      });
      localStorage.setItem('token', loginRes.data.access_token);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      
      setUserName(formData.full_name || formData.email.split('@')[0]);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 7000);
    } catch (err) {
      if (err.response?.data?.email) {
        setError(err.response.data.email[0]);
      } else {
        setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Blur-to-focus staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.6, ease: "easeOut" } }
  };

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  };

  const passwordsMatch = formData.confirm_password && formData.password === formData.confirm_password;
  const passwordsMismatch = formData.confirm_password && formData.password !== formData.confirm_password;

  return (
    <motion.div 
      key="register-page"
      initial="hidden" animate="visible" exit="exit"
      className="relative min-h-screen flex text-gray-100 overflow-hidden"
    >
      <CosmicAuthBackground mode="register" />

      {/* Two column layout */}
      <div className="relative z-10 w-full flex flex-col md:flex-row min-h-screen">
        
        {/* Left Visual Area */}
        <div className="hidden md:flex md:w-[50%] flex-col items-center justify-center p-8 border-r border-gray-800/30">
          <RegisterTarotPortal />
        </div>

        {/* Right Form Area */}
        <div className="w-full md:w-[50%] flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div 
                key="form-container"
                variants={containerVariants}
                initial="hidden"
                animate={error ? "visible" : "visible"}
                className="w-full max-w-md bg-[#0f0c1e]/70 backdrop-blur-xl p-8 sm:p-10 rounded-[24px] border border-purple-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] my-auto"
              >
                
                <motion.div variants={itemVariants} className="mb-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_#facc15]"></motion.div>
                    <span className="text-[10px] tracking-[0.2em] text-yellow-500/80 font-bold">YOUR JOURNEY AWAITS</span>
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-300">
                    Begin Your Journey
                  </h2>
                  <p className="text-sm text-gray-400 mt-2">Create your account to explore your personalized reading.</p>
                </motion.div>

                {error && (
                  <motion.div animate={shakeAnimation} className="mb-4 p-3 rounded bg-red-900/30 border border-red-500/50 text-red-200 text-sm text-center">
                    {error}
                  </motion.div>
                )}
                
                <motion.form variants={containerVariants} onSubmit={handleRegister} className="flex flex-col gap-5">
                  
                  {/* Role */}
                  <motion.div variants={itemVariants} className="flex justify-center mb-2">
                    <div className="flex p-1 bg-[#0a0815] rounded-lg border border-purple-900/30">
                      <button type="button" onClick={() => setFormData({...formData, role: 'User'})} className={`px-6 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${formData.role === 'User' ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'text-gray-500'}`}>User</button>
                      <button type="button" onClick={() => setFormData({...formData, role: 'Admin'})} className={`px-6 py-1.5 text-xs font-bold uppercase rounded-md transition-all ${formData.role === 'Admin' ? 'bg-purple-600/80 text-white shadow-[0_0_10px_rgba(168,85,247,0.3)]' : 'text-gray-500'}`}>Admin</button>
                    </div>
                  </motion.div>

                  {/* Name */}
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedInput === 'full_name' || formData.full_name ? '-top-2.5 text-[10px] uppercase font-bold bg-[#0f0c1e] px-2 text-purple-400' : 'top-3.5 text-sm text-gray-500'}`}>Full Name</label>
                    <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} onFocus={() => setFocusedInput('full_name')} onBlur={() => setFocusedInput(null)} required className={`w-full p-3.5 bg-gray-900/50 border rounded-xl text-white outline-none transition-all duration-300 ${focusedInput === 'full_name' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-gray-700/50'}`} />
                  </motion.div>

                  {/* Email */}
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedInput === 'email' || formData.email ? '-top-2.5 text-[10px] uppercase font-bold bg-[#0f0c1e] px-2 text-purple-400' : 'top-3.5 text-sm text-gray-500'}`}>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedInput('email')} onBlur={() => setFocusedInput(null)} required className={`w-full p-3.5 bg-gray-900/50 border rounded-xl text-white outline-none transition-all duration-300 ${focusedInput === 'email' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-gray-700/50'}`} />
                  </motion.div>

                  {/* Password */}
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedInput === 'password' || formData.password ? '-top-2.5 text-[10px] uppercase font-bold bg-[#0f0c1e] px-2 text-pink-400' : 'top-3.5 text-sm text-gray-500'}`}>Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} onFocus={() => setFocusedInput('password')} onBlur={() => setFocusedInput(null)} required className={`w-full p-3.5 bg-gray-900/50 border rounded-xl text-white outline-none transition-all duration-300 ${focusedInput === 'password' ? 'border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'border-gray-700/50'}`} />
                    
                    {formData.password && (
                      <div className="absolute right-4 top-4 flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${passwordStrength.color.replace('bg-', 'text-')}`}>{passwordStrength.label}</span>
                        <div className="flex gap-1">
                          <div className={`w-3 h-1 rounded ${passwordStrength.score >= 1 ? passwordStrength.color : 'bg-gray-700'}`}></div>
                          <div className={`w-3 h-1 rounded ${passwordStrength.score >= 2 ? passwordStrength.color : 'bg-gray-700'}`}></div>
                          <div className={`w-3 h-1 rounded ${passwordStrength.score >= 3 ? passwordStrength.color : 'bg-gray-700'}`}></div>
                        </div>
                      </div>
                    )}
                  </motion.div>

                  {/* Confirm Password */}
                  <motion.div variants={itemVariants} className="relative">
                    <label className={`absolute left-4 transition-all duration-300 pointer-events-none ${focusedInput === 'confirm_password' || formData.confirm_password ? '-top-2.5 text-[10px] uppercase font-bold bg-[#0f0c1e] px-2 text-pink-400' : 'top-3.5 text-sm text-gray-500'}`}>Confirm Password</label>
                    <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} onFocus={() => setFocusedInput('confirm_password')} onBlur={() => setFocusedInput(null)} required className={`w-full p-3.5 bg-gray-900/50 border rounded-xl text-white outline-none transition-all duration-300 ${passwordsMismatch ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : passwordsMatch ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : focusedInput === 'confirm_password' ? 'border-pink-500' : 'border-gray-700/50'}`} />
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <motion.button whileHover={{ scale: 1.02, y: -1, boxShadow: "0px 5px 20px rgba(168,85,247,0.3)" }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full mt-2 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-bold transition flex items-center justify-center gap-2 relative overflow-hidden">
                      {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating Account...</> : 'CREATE ACCOUNT'}
                    </motion.button>
                  </motion.div>

                </motion.form>

                <motion.div variants={itemVariants} className="mt-8 text-center text-sm text-gray-400 border-t border-gray-800 pt-6">
                  Already have an account? <Link to="/login" className="text-pink-400 font-semibold hover:text-pink-300 transition-colors">Sign In</Link>
                </motion.div>
                
              </motion.div>
            ) : (
              <motion.div 
                key="success-container" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 w-screen h-screen bg-[#050b14] flex items-center justify-center"
              >
                <DoorUnlockAnimation userName={userName} role={formData.role} />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </motion.div>
  );
};

export default Register;

