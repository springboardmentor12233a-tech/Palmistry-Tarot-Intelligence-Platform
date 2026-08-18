import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import { getSpreads, createReading } from '../api/tarot';

const TarotSelection = () => {
  const [spreads, setSpreads] = useState({});
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSpreads = async () => {
      try {
        const response = await getSpreads();
        // Just preselect the first one for a more seamless UX if available
        const data = response.data;
        setSpreads(data);
        if (Object.keys(data).length > 0) {
          setSelectedSpread(Object.keys(data)[0]);
        }
      } catch (error) {
        console.error("Failed to load spreads", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSpreads();
  }, []);

  const location = useLocation();
  const globalReadingId = location.state?.reading_id;

  const handleStart = async () => {
    if (!selectedSpread) return;
    try {
      const res = await createReading({
        reading_type: selectedSpread,
        question: question
      });
      
      const tarotReadingId = res.data.id;
      
      if (globalReadingId) {
        try {
          const { updateReading } = await import('../services/readingService');
          await updateReading(globalReadingId, { 
            tarot_reading_id: tarotReadingId,
            question: question
          });
        } catch (e) {
          console.error("Failed to link tarot reading to global reading:", e);
        }
      }
      
      navigate(`/tarot/read/${tarotReadingId}`, { state: { spreadDef: spreads[selectedSpread], global_reading_id: globalReadingId } });
    } catch (err) {
      alert("Failed to initialize reading.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#050b14]">
      <div className="w-16 h-16 rounded-full border-4 border-gray-800 border-t-purple-400 animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 relative z-10 flex flex-col items-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-gold-900/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-5xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-purple-900/30 rounded-full border border-purple-500/30 mb-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <Sparkles className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Tarot Reading
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-light">
            Focus on your intention and prepare to draw a card to reveal its traditional symbolism.
          </p>
        </div>

        {/* Intention & Question */}
        <div className="bg-[#0a1128]/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden group hover:border-purple-500/30 transition-colors duration-500">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <Sparkles size={100} />
           </div>
           <div className="relative z-10">
             <label className="block text-gray-300 mb-4 font-bold text-center text-lg">What would you like guidance about? (Optional)</label>
             <textarea
               className="w-full bg-[#050b14] border border-gray-700 rounded-2xl p-6 text-white focus:outline-none focus:border-purple-500 transition shadow-inner placeholder-gray-600 text-center resize-none"
               placeholder="e.g. My career path, a specific relationship, or general guidance..."
               value={question}
               onChange={(e) => setQuestion(e.target.value)}
               rows={3}
             />
           </div>
        </div>

        {/* Spread Selection */}
        <div className="flex flex-col items-center">
          <h2 className="text-2xl font-bold text-white mb-8">Choose Your Spread</h2>
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            {Object.entries(spreads)
              .filter(([key]) => key === 'single_card' || key === 'three_card')
              .map(([key, spread]) => (
                <div 
                  key={key}
                  onClick={() => setSelectedSpread(key)}
                  className={`relative w-72 p-6 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex flex-col items-center text-center space-y-4 ${
                    selectedSpread === key 
                      ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] scale-105' 
                      : 'bg-[#0a1128]/80 border-gray-700 hover:border-gray-500 hover:bg-[#0a1128]'
                  }`}
                >
                  {selectedSpread === key && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full p-1.5 shadow-lg">
                      <Sparkles size={16} />
                    </div>
                  )}
                  <div className="w-16 h-16 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center mb-2">
                    <BookOpen className={selectedSpread === key ? "text-purple-400" : "text-gray-500"} size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-gold-400">{spread.name}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{spread.description}</p>
                </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={handleStart}
              disabled={!selectedSpread}
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center gap-2 ${
                selectedSpread 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)]' 
                  : 'bg-gray-800 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Reading <ChevronRight size={20} />
            </button>
            <p className="text-gray-500 mt-4 text-sm">Focus on your intention before continuing.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TarotSelection;
