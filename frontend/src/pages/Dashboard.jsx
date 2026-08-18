import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Hand, Sparkles, Wand2, Camera, ScanFace, BrainCircuit, FileText, ChevronRight, Activity } from 'lucide-react';
import { getReadings, createReading } from '../services/readingService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (user.role === 'Admin') {
      navigate('/admin-dashboard');
    }
  }, [navigate, user.role]);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const response = await getReadings();
        setReadings(response.data);
      } catch (error) {
        console.error('Failed to fetch readings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, []);

  const handleStartPalmReading = async () => {
    try {
      const response = await createReading();
      navigate(`/palm-reading`, { state: { reading_id: response.data.id } });
    } catch (error) {
      console.error('Failed to start reading:', error);
    }
  };

  const stats = {
    total: readings.length,
    palm: readings.filter(r => r.reading_type === 'palm' || r.reading_type === 'combined').length,
    tarot: readings.filter(r => r.reading_type === 'tarot' || r.reading_type === 'combined').length,
    reports: readings.filter(r => r.pdf_report_path).length,
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-900/20 rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        variants={containerVariants} initial="hidden" animate="visible"
        className="w-full max-w-6xl space-y-12"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="text-center space-y-4">
          <h2 className="text-sm font-bold text-cyan-400 tracking-[0.2em] uppercase">Your Spiritual Journey</h2>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 tracking-tight">
            Discover the Story Written in Your Palm
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Welcome back, <span className="text-gray-200 font-semibold">{user.username || 'Explorer'}</span>. Ready to explore traditional palmistry and Tarot symbolism through AI-powered visual analysis?
          </p>
        </motion.div>

        {/* Action Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="group relative bg-[#0a1128]/80 backdrop-blur-xl border border-blue-900/40 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
              <Hand size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Hand className="text-cyan-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Palm Reading</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Analyze your palm and explore traditional palmistry interpretations.
              </p>
              <button onClick={handleStartPalmReading} className="w-full py-3 px-4 rounded-xl bg-cyan-900/30 hover:bg-cyan-600/40 border border-cyan-500/30 text-cyan-300 font-semibold transition flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                Start Reading <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="group relative bg-[#0a1128]/80 backdrop-blur-xl border border-purple-900/40 rounded-3xl p-8 hover:border-purple-500/50 transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110 group-hover:-rotate-12">
              <Sparkles size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <Sparkles className="text-purple-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Tarot Reading</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Draw a Tarot card and explore its traditional symbolism.
              </p>
              <button onClick={() => navigate('/tarot')} className="w-full py-3 px-4 rounded-xl bg-purple-900/30 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 font-semibold transition flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                Draw a Card <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="group relative bg-[#0a1128]/80 backdrop-blur-xl border border-pink-900/40 rounded-3xl p-8 hover:border-pink-500/50 transition-all duration-500 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110">
              <Wand2 size={120} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500/20 to-rose-600/20 border border-pink-500/30 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                <Wand2 className="text-pink-400" size={28} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Combined Reading</h3>
              <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                Combine Palmistry and Tarot into one AI-generated reflection.
              </p>
              <button onClick={handleStartPalmReading} className="w-full py-3 px-4 rounded-xl bg-pink-900/30 hover:bg-pink-600/40 border border-pink-500/30 text-pink-300 font-semibold transition flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                Begin Journey <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

        </motion.div>

        {/* Reading Process Timeline */}
        <motion.div variants={itemVariants} className="bg-[#050b14]/50 border border-gray-800 rounded-3xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-8 text-center tracking-wide">How Your Reading Works</h3>
          <div className="flex flex-col md:flex-row justify-between items-center relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gray-800 -z-10"></div>
            
            {[
              { icon: Camera, label: "Capture Palm", num: "01" },
              { icon: ScanFace, label: "Detect Hand", num: "02" },
              { icon: Activity, label: "Analyze Lines", num: "03" },
              { icon: Sparkles, label: "Draw Tarot", num: "04" },
              { icon: BrainCircuit, label: "AI Synthesis", num: "05" },
              { icon: FileText, label: "Your Reading", num: "06" },
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center group mb-6 md:mb-0">
                <span className="text-xs font-mono text-gray-500 mb-3">{step.num}</span>
                <div className="w-14 h-14 rounded-full bg-[#0a1128] border border-gray-700 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all duration-300 group-hover:-translate-y-2">
                  <step.icon size={20} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <span className="text-sm text-gray-400 mt-4 font-medium group-hover:text-gray-200 transition-colors">{step.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Readings', value: stats.total, color: 'text-blue-400', bg: 'bg-blue-900/20' },
            { label: 'Palm Readings', value: stats.palm, color: 'text-cyan-400', bg: 'bg-cyan-900/20' },
            { label: 'Tarot Readings', value: stats.tarot, color: 'text-purple-400', bg: 'bg-purple-900/20' },
            { label: 'Generated Reports', value: stats.reports, color: 'text-pink-400', bg: 'bg-pink-900/20' },
          ].map((stat, idx) => (
            <div key={idx} className={`p-6 rounded-2xl border border-gray-800 ${stat.bg} backdrop-blur flex flex-col items-center justify-center text-center hover:border-gray-600 transition-colors`}>
              <span className={`text-3xl font-bold font-mono mb-1 ${stat.color}`}>{loading ? '-' : stat.value}</span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
