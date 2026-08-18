import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Hand, Network, Download, FileText, Heart, Briefcase, Brain, Compass } from 'lucide-react';
import { generateSynthesis, chatWithReading } from '../services/aiService';
import { getReadings } from '../services/readingService';
import api from '../services/api';

const CombinedReading = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [synthesis, setSynthesis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Chatbot State
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([{ role: 'ai', text: "I am your AI Spiritual Guide. Ask me any questions about your reading." }]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  // Animation state
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    const fetchSynthesis = async () => {
      try {
        // Orchestrate animation steps while waiting for network
        setTimeout(() => setLoadingStep(1), 1500); // Tarot Symbolism
        setTimeout(() => setLoadingStep(2), 3000); // AI Interpretation
        setTimeout(() => setLoadingStep(3), 4500); // Personal Reflection
        
        const { generateSynthesis } = await import('../services/readingService');
        const response = await generateSynthesis(id);
        
        setTimeout(() => {
          setSynthesis(response.data);
          setLoading(false);
        }, 5500); // Minimum time to show animation
        
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.detail || "Your Palm and Tarot results are ready, but the combined AI interpretation is temporarily unavailable.");
        setLoading(false);
      }
    };
    fetchSynthesis();
  }, [id]);

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    // Open tab synchronously to bypass popup blockers
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('Generating PDF...');
    }
    
    try {
      const response = await api.post(`/api/reports/${id}/generate`);
      if (response.data.path) {
        const url = api.defaults.baseURL.replace(/\/$/, '') + response.data.path;
        if (newWindow) {
          newWindow.location.href = url;
        } else {
          window.location.href = url;
        }
      } else {
        if (newWindow) newWindow.close();
      }
    } catch (err) {
      if (newWindow) newWindow.close();
      alert("Your reading is complete, but the PDF could not be generated.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatLoading) return;
    
    const userMsg = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatMessage('');
    setIsChatLoading(true);
    
    try {
      const response = await chatWithReading(id, userMsg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response.data.answer }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting right now." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const loadingSteps = ["Palm Features", "Tarot Symbolism", "AI Interpretation", "Personal Reflection"];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#050b14] relative z-10 px-4">
        {/* Connection Animation */}
        <div className="relative w-full max-w-lg h-64 flex items-center justify-between mb-12">
           <motion.div 
             animate={{ x: [0, 50, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity }}
             className="w-24 h-24 rounded-full bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.5)] z-10"
           >
             <Hand className="text-cyan-400" size={40} />
           </motion.div>
           
           {/* Connecting Line */}
           <div className="absolute left-12 right-12 h-1 overflow-hidden">
             <div className="w-full h-full bg-gray-800"></div>
             <motion.div 
               animate={{ left: ['-100%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
               className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
             ></motion.div>
           </div>
           
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }}
             className="absolute left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-purple-900/60 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_50px_rgba(168,85,247,0.8)] z-20"
           >
             <Network className="text-purple-300" size={50} />
           </motion.div>

           <motion.div 
             animate={{ x: [0, -50, 0], opacity: [0.5, 1, 0.5] }} transition={{ duration: 4, repeat: Infinity, delay: 1 }}
             className="w-24 h-24 rounded-full bg-gold-900/40 border border-gold-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.5)] z-10"
           >
             <Sparkles className="text-gold-400" size={40} />
           </motion.div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-8 tracking-widest uppercase">Connecting your insights...</h2>
        
        <div className="space-y-4 w-full max-w-sm">
          {loadingSteps.map((step, idx) => (
            <div key={idx} className={`flex items-center gap-4 transition-all duration-500 ${idx <= loadingStep ? 'opacity-100 translate-x-0' : 'opacity-20 -translate-x-4'}`}>
              <div className={`w-3 h-3 rounded-full ${idx < loadingStep ? 'bg-green-400 shadow-[0_0_10px_rgba(74,222,128,1)]' : idx === loadingStep ? 'bg-purple-400 animate-ping' : 'bg-gray-700'}`}></div>
              <span className={`font-mono text-sm tracking-wider ${idx <= loadingStep ? 'text-gray-200' : 'text-gray-600'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-32 px-4 flex flex-col items-center">
        <div className="bg-red-900/20 border border-red-500/30 p-8 rounded-3xl max-w-2xl text-center">
          <p className="text-red-400 text-lg mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
             <button onClick={() => window.location.reload()} className="px-6 py-3 rounded-xl bg-red-900/50 hover:bg-red-800 border border-red-500/50 text-white font-bold transition">Retry AI Interpretation</button>
             <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition">View Palm + Tarot Results</button>
          </div>
        </div>
      </div>
    );
  }

  if (!synthesis) return null;

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10">
      
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-900/10 via-purple-900/10 to-pink-900/10 rounded-full blur-[150px]"></div>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-full border border-purple-500/30 mb-2 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            <Network className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 tracking-tight">
            Your Combined Reading
          </h1>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 py-4">
          <button 
            onClick={handleDownloadPDF} 
            disabled={pdfLoading}
            className="px-8 py-3 bg-[#0a1128]/80 backdrop-blur border border-cyan-500/50 hover:bg-cyan-900/30 rounded-xl font-bold transition shadow-[0_0_20px_rgba(6,182,212,0.2)] text-white flex items-center justify-center gap-3 group"
          >
            {pdfLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : <Download size={18} className="group-hover:-translate-y-1 transition-transform" />}
            {pdfLoading ? 'Preparing Document...' : 'Download Beautiful PDF'}
          </button>
        </div>

        {/* OVERALL THEME */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="relative overflow-hidden bg-gradient-to-br from-[#0a1128] to-purple-900/20 border border-purple-500/30 rounded-3xl p-8 md:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles size={160} />
          </div>
          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4">🌙 Overall Theme</h2>
            <p className="text-xl md:text-2xl text-gray-200 leading-relaxed font-light">
              "{synthesis.overall_insight}"
            </p>
          </div>
        </motion.div>
        
        {/* GRID SECTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl hover:border-pink-500/30 transition-colors shadow-xl group">
            <h3 className="text-xl font-bold text-pink-400 mb-6 flex items-center gap-3">
              <div className="p-2 bg-pink-900/30 rounded-lg group-hover:bg-pink-900/50 transition-colors"><Heart size={20} /></div> 
              Relationships
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">{synthesis.relationships?.summary}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl hover:border-cyan-500/30 transition-colors shadow-xl group">
            <h3 className="text-xl font-bold text-cyan-400 mb-6 flex items-center gap-3">
              <div className="p-2 bg-cyan-900/30 rounded-lg group-hover:bg-cyan-900/50 transition-colors"><Briefcase size={20} /></div> 
              Career
            </h3>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">{synthesis.career?.summary}</p>
            </div>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 p-8 rounded-3xl hover:border-purple-500/30 transition-colors shadow-xl group md:col-span-2">
            <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-3">
              <div className="p-2 bg-purple-900/30 rounded-lg group-hover:bg-purple-900/50 transition-colors"><Brain size={20} /></div> 
              Personal Growth
            </h3>
            <div className="space-y-4 max-w-4xl">
              <p className="text-gray-300 leading-relaxed">{synthesis.personal_growth?.summary}</p>
            </div>
          </motion.div>

        </div>
        
        {/* GUIDANCE & REFLECTION */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-gradient-to-br from-pink-900/20 to-[#0a1128] border border-pink-500/30 p-8 md:p-12 rounded-3xl shadow-[0_0_40px_rgba(236,72,153,0.1)]">
          <h2 className="text-2xl font-bold text-pink-300 mb-8 flex items-center justify-center gap-3">
            ✨ Guidance & Reflection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div>
                <ul className="space-y-6">
                  {synthesis.reflection_questions?.slice(0,3).map((q, idx) => (
                    <li key={idx} className="flex gap-4 items-start bg-black/20 p-4 rounded-xl border border-gray-800/50">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-pink-900/50 text-pink-400 flex items-center justify-center font-bold font-mono text-sm border border-pink-500/30">{idx + 1}</span>
                      <span className="text-gray-300 mt-1 italic leading-relaxed">"{q}"</span>
                    </li>
                  ))}
                </ul>
             </div>
              <div className="text-center p-8 border border-gray-800 rounded-2xl bg-[#050b14]/50">
                <FileText className="text-gray-500 mx-auto mb-4" size={48} />
                <h4 className="text-white font-bold mb-2">Keep your insights forever</h4>
                <p className="text-gray-400 text-sm mb-6">Download a premium PDF report detailing your palm features, tarot cards, and combined AI synthesis.</p>
                <button onClick={handleDownloadPDF} disabled={pdfLoading} className="px-6 py-3 w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-white shadow-lg transition flex items-center justify-center gap-2">
                  {pdfLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Download size={16} />}
                  Get PDF Report
                </button>
             </div>
          </div>
        </motion.div>
        
        {/* RAG AI CHATBOT */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="bg-[#0a1128]/80 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.1)]">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 bg-cyan-900/30 rounded-xl text-cyan-400"><Brain size={24} /></div>
             <div>
               <h3 className="text-2xl font-bold text-white">Ask Your AI Guide</h3>
               <p className="text-cyan-400 text-sm">Dive deeper into your reading</p>
             </div>
           </div>
           
           <div className="bg-[#050b14] border border-gray-800 rounded-2xl h-80 overflow-y-auto p-6 mb-4 space-y-4">
             {chatHistory.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'}`}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {isChatLoading && (
               <div className="flex justify-start">
                 <div className="bg-gray-800 text-gray-400 p-4 rounded-2xl rounded-bl-none border border-gray-700 flex items-center gap-2">
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></div>
                   <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                 </div>
               </div>
             )}
           </div>
           
           <form onSubmit={handleSendMessage} className="flex gap-4">
             <input 
               type="text" 
               value={chatMessage} 
               onChange={(e) => setChatMessage(e.target.value)} 
               placeholder="e.g. What does my Fate line say about my new job?" 
               className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:outline-none focus:border-cyan-500 transition"
               disabled={isChatLoading}
             />
             <button type="submit" disabled={isChatLoading || !chatMessage.trim()} className="px-8 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg">
               Ask
             </button>
           </form>
        </motion.div>
        
        {/* Bottom Nav */}
        <div className="flex justify-center pt-8 border-t border-gray-800">
           <button onClick={() => navigate('/history')} className="text-gray-400 hover:text-white transition font-medium">
             Save to Reading History →
           </button>
        </div>

      </div>
    </div>
  );
};

export default CombinedReading;
