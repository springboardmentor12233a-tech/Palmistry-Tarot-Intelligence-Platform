import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Hand, Sparkles, Network, FileText, Trash2, ArrowRight } from 'lucide-react';
import { getReadings } from '../services/readingService';
import api from '../services/api';

const ReadingHistory = () => {
  const navigate = useNavigate();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getIcon = (type) => {
    if (type === 'palm') return <Hand size={20} className="text-cyan-400" />;
    if (type === 'tarot') return <Sparkles size={20} className="text-gold-400" />;
    return <Network size={20} className="text-purple-400" />;
  };

  const getStatusColor = (status) => {
    if (['completed', 'report_generated', 'ai_completed'].includes(status)) return 'text-green-400 bg-green-900/30 border-green-500/30';
    return 'text-orange-400 bg-orange-900/30 border-orange-500/30';
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-[10%] right-0 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-900/30 rounded-full border border-purple-500/30 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <BookOpen className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Your Reading Journey
          </h1>
          <p className="text-gray-400 text-lg">A timeline of your spiritual exploration.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-gray-800 border-t-cyan-400 rounded-full animate-spin"></div>
          </div>
        ) : readings.length === 0 ? (
          <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 p-12 rounded-3xl text-center shadow-xl">
             <div className="w-20 h-20 rounded-full bg-gray-900 mx-auto flex items-center justify-center mb-6">
                <BookOpen size={32} className="text-gray-600" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">No readings yet</h3>
             <p className="text-gray-400 mb-8">Start your first reading to begin building your journey timeline.</p>
             <button onClick={() => navigate('/dashboard')} className="px-8 py-3 bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl transition">
               Go to Dashboard
             </button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-[39px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-pink-500/50 hidden md:block"></div>
            
            <div className="space-y-12">
              {readings.map((reading, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  key={reading.id} className="relative flex flex-col md:flex-row gap-6 md:gap-12 group"
                >
                  {/* Timeline Node */}
                  <div className="hidden md:flex flex-col items-center relative z-10">
                     <div className="w-20 text-right pr-6 pt-3 text-sm font-bold text-gray-500">
                       {new Date(reading.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                     </div>
                     <div className="absolute top-1/2 -translate-y-1/2 left-[28px] w-6 h-6 rounded-full bg-[#050b14] border-2 border-purple-500 flex items-center justify-center group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all">
                       <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-cyan-400 transition-colors"></div>
                     </div>
                  </div>

                  {/* Card */}
                  <div className="flex-1 bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 md:p-8 hover:border-purple-500/30 transition-all duration-300 shadow-xl group-hover:-translate-y-1 group-hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                              {getIcon(reading.reading_type)}
                           </div>
                           <div>
                             <h3 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                               {reading.reading_type} Reading
                             </h3>
                             <span className="md:hidden text-xs text-gray-500 mt-1 block">
                               {new Date(reading.created_at).toLocaleDateString()}
                             </span>
                           </div>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${getStatusColor(reading.status)}`}>
                          {reading.status.replace('_', ' ')}
                        </span>
                     </div>
                     
                     {reading.overall_insight && (
                       <p className="text-gray-400 leading-relaxed mb-6 italic">"{reading.overall_insight}"</p>
                     )}
                     
                     <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-800/50">
                        <button 
                          onClick={() => {
                            if (reading.status === 'started') navigate('/palm-reading', { state: { reading_id: reading.id } });
                            else if (reading.status === 'palm_completed') navigate('/tarot', { state: { reading_id: reading.id } });
                            else navigate(`/combined-reading/${reading.id}`);
                          }}
                          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-900/50 to-cyan-900/50 hover:from-purple-800/50 hover:to-cyan-800/50 border border-purple-500/30 text-white font-medium rounded-xl transition text-sm"
                        >
                          {reading.status === 'started' || reading.status === 'palm_completed' ? 'Continue' : 'View Result'} <ArrowRight size={16} />
                        </button>
                        
                        {reading.pdf_report_path && (
                          <button onClick={() => window.open(api.defaults.baseURL.replace(/\/$/, '') + reading.pdf_report_path, '_blank')} className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition text-sm">
                            <FileText size={16} /> PDF
                          </button>
                        )}
                        
                        <button className="flex items-center gap-2 px-4 py-2.5 hover:bg-red-900/20 text-gray-500 hover:text-red-400 font-medium rounded-xl transition text-sm ml-auto">
                          <Trash2 size={16} />
                        </button>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReadingHistory;
