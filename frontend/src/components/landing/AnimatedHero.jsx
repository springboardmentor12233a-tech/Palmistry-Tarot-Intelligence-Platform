import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Scan, Brain, Star } from 'lucide-react';
import InteractiveDemoModal from './InteractiveDemoModal';

const AnimatedHero = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0);
  const [showDemo, setShowDemo] = useState(false);

  // 10-second looping animation sequence
  useEffect(() => {
    const sequence = [
      { p: 0, duration: 2000 }, // 0-2s: Tarot emerges
      { p: 1, duration: 2000 }, // 2-4s: Palm scanning
      { p: 2, duration: 2000 }, // 4-6s: Lines detected
      { p: 3, duration: 2000 }, // 6-8s: Hand -> Tarot 3D -> AI
      { p: 4, duration: 2000 }, // 8-10s: Final result
    ];

    let currentPhase = 0;
    let timeout;

    const runSequence = () => {
      setPhase(currentPhase);
      const delay = sequence[currentPhase].duration;
      currentPhase = (currentPhase + 1) % sequence.length;
      timeout = setTimeout(runSequence, delay);
    };

    runSequence();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative min-h-[90vh] w-full flex flex-col md:flex-row items-center justify-center pt-20 px-4 md:px-12 z-10 overflow-hidden">
      
      {/* Left: Text & CTA */}
      <div className="w-full md:w-1/2 flex flex-col items-start z-20">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-blue-400 to-pink-500 tracking-tight"
        >
          AI PALMISTRY <br/> & TAROT
        </motion.h1>
        
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-2xl text-white font-medium mb-4"
        >
          Your hand tells a story. <br/> AI helps you explore it.
        </motion.h2>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-lg text-gray-400 max-w-lg mb-10 leading-relaxed"
        >
          Upload your palm or use your camera. Our AI analyzes palm features and combines them with Tarot symbolism to create a personalized spiritual reading.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button 
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] transition-all hover:scale-105"
          >
            START YOUR READING
          </button>
          <button 
            onClick={() => setShowDemo(true)}
            className="px-8 py-4 bg-gray-900/80 backdrop-blur-md border border-purple-500/30 hover:border-purple-400 rounded-xl font-bold text-white transition-all hover:scale-105 flex items-center justify-center gap-2"
          >
            WATCH INTERACTIVE DEMO
          </button>
        </motion.div>
      </div>

      {/* Right: Animation Sequence */}
      <div className="w-full md:w-1/2 h-[500px] md:h-[600px] relative mt-16 md:mt-0 z-10 flex items-center justify-center perspective-1000">
        
        <AnimatePresence mode="wait">
          {/* Phase 0: Tarot Emerges */}
          {phase === 0 && (
            <motion.div
              key="phase0"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, x: 100, rotateY: 45 }}
              transition={{ duration: 0.8 }}
              className="absolute flex flex-col items-center"
            >
              <div className="w-48 h-72 rounded-xl bg-gradient-to-br from-indigo-900 to-purple-950 border border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg')] bg-cover opacity-60 mix-blend-overlay"></div>
                 <motion.div animate={{ left: ['-100%', '200%'] }} transition={{ duration: 1.5, ease: "easeInOut" }} className="absolute inset-y-0 w-20 bg-white/20 skew-x-12 blur-md"></motion.div>
                 <Sparkles className="text-gold-400 absolute animate-pulse" size={40} />
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-purple-300 font-bold tracking-[0.2em] text-sm">BEGIN YOUR JOURNEY</motion.p>
            </motion.div>
          )}

          {/* Phase 1: Palm Scan */}
          {phase === 1 && (
            <motion.div
              key="phase1"
              initial={{ opacity: 0, rotateX: -20 }}
              animate={{ opacity: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className="relative w-[250px] h-[350px]">
                {/* Real Hand Image */}
                <div className="absolute inset-0 bg-[url('/palm-silhouette.png')] bg-cover bg-center opacity-80 mix-blend-screen drop-shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-3xl overflow-hidden"></div>
                {/* Scanning Beam */}
                <motion.div 
                  initial={{ top: '0%' }} 
                  animate={{ top: '100%' }} 
                  transition={{ duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-20"
                ></motion.div>
              </div>
              <div className="mt-4 flex flex-col items-center">
                <p className="text-cyan-400 font-bold tracking-[0.2em] text-sm">SCAN YOUR PALM</p>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="text-green-400 text-xs mt-1 flex items-center gap-1">
                  ✓ Hand detected
                </motion.p>
              </div>
            </motion.div>
          )}

          {/* Phase 2: Lines Detected */}
          {phase === 2 && (
            <motion.div
              key="phase2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="absolute flex items-center gap-8"
            >
              <div className="relative w-[250px] h-[350px]">
                {/* Real Hand Image */}
                <div className="absolute inset-0 bg-[url('/palm-silhouette.png')] bg-cover bg-center opacity-40 mix-blend-screen rounded-3xl overflow-hidden drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]"></div>
                
                <svg viewBox="0 0 100 150" className="absolute inset-0 w-full h-full z-10 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]">
                  {/* Heart */}
                  <motion.path d="M 25,60 Q 50,70 80,50" fill="transparent" stroke="#f472b6" strokeWidth="1.5" initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 0.4, delay: 0}} />
                  {/* Head */}
                  <motion.path d="M 25,75 Q 50,85 75,100" fill="transparent" stroke="#818cf8" strokeWidth="1.5" initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 0.4, delay: 0.3}} />
                  {/* Life */}
                  <motion.path d="M 25,75 Q 40,110 60,140" fill="transparent" stroke="#c084fc" strokeWidth="1.5" initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 0.4, delay: 0.6}} />
                  {/* Fate */}
                  <motion.path d="M 60,140 Q 60,100 65,40" fill="transparent" stroke="#34d399" strokeWidth="1.5" initial={{pathLength: 0}} animate={{pathLength: 1}} transition={{duration: 0.4, delay: 0.9}} />
                </svg>
              </div>
              
              <div className="flex flex-col gap-3">
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.2}} className="text-xs text-pink-400 font-bold bg-pink-900/30 px-3 py-1 rounded">HEART LINE ✓</motion.div>
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.5}} className="text-xs text-indigo-400 font-bold bg-indigo-900/30 px-3 py-1 rounded">HEAD LINE ✓</motion.div>
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:0.8}} className="text-xs text-purple-400 font-bold bg-purple-900/30 px-3 py-1 rounded">LIFE LINE ✓</motion.div>
                <motion.div initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} transition={{delay:1.1}} className="text-xs text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded">FATE LINE ✓</motion.div>
                
                <div className="mt-4">
                  <motion.p animate={{ opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-[10px] text-gray-500 uppercase tracking-widest">ANALYZING PALM...</motion.p>
                  <motion.p initial={{opacity: 0}} animate={{opacity: 1}} transition={{delay: 1.5}} className="text-xs text-green-400 font-bold uppercase mt-1">PALM ANALYSIS COMPLETE ✓</motion.p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 3: Tarot Insight & AI Synthesis */}
          {phase === 3 && (
            <motion.div
              key="phase3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                 {/* Center AI Orb */}
                 <Brain className="text-purple-400 z-30 absolute" size={40} />
                 <div className="absolute w-16 h-16 bg-purple-600 rounded-full blur-xl z-20 opacity-50 animate-pulse"></div>
                 
                 {/* Floating Cards around center */}
                 <motion.div initial={{rotate: -30, x: -50}} animate={{rotate: -20, x: -60}} className="absolute w-20 h-32 bg-gray-800 rounded border border-gray-600 shadow-xl"></motion.div>
                 <motion.div initial={{rotate: 30, x: 50}} animate={{rotate: 20, x: 60}} className="absolute w-20 h-32 bg-gray-800 rounded border border-gray-600 shadow-xl"></motion.div>
                 <motion.div initial={{y: 50}} animate={{y: 40}} className="absolute w-24 h-36 bg-gradient-to-br from-indigo-900 to-purple-900 rounded border border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.5)] z-40 flex items-center justify-center">
                    <Star className="text-gold-400 opacity-50" />
                 </motion.div>
              </div>
              
              <div className="text-center mt-2">
                <p className="text-purple-300 font-bold tracking-[0.2em] text-sm mb-2">TAROT INSIGHT</p>
                <div className="text-xs text-gray-400 flex flex-col items-center gap-1">
                  <span>Palm Analysis</span>
                  <span className="text-gold-400">+</span>
                  <span>Tarot Symbolism</span>
                  <span className="text-purple-400">↓</span>
                  <span className="text-white font-bold">AI Interpretation</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 4: Final Result */}
          {phase === 4 && (
            <motion.div
              key="phase4"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="absolute flex flex-col items-center"
            >
              <div className="w-72 bg-gray-900/90 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.2)]">
                 <h3 className="text-white font-bold text-lg mb-4 text-center border-b border-gray-800 pb-2">YOUR AI READING</h3>
                 
                 <div className="space-y-3">
                   <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: 0.2}} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-pink-900/30 flex items-center justify-center text-pink-400 text-xs">❤️</div>
                     <span className="text-gray-300 text-sm">Relationships</span>
                   </motion.div>
                   <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: 0.4}} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-blue-900/30 flex items-center justify-center text-blue-400 text-xs">💼</div>
                     <span className="text-gray-300 text-sm">Career</span>
                   </motion.div>
                   <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: 0.6}} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-green-900/30 flex items-center justify-center text-green-400 text-xs">🌱</div>
                     <span className="text-gray-300 text-sm">Personal Growth</span>
                   </motion.div>
                   <motion.div initial={{opacity:0, x:-10}} animate={{opacity:1, x:0}} transition={{delay: 0.8}} className="flex items-center gap-3">
                     <div className="w-6 h-6 rounded bg-purple-900/30 flex items-center justify-center text-purple-400 text-xs">✨</div>
                     <span className="text-gray-300 text-sm">Life Themes</span>
                   </motion.div>
                 </div>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="mt-8 text-gold-400 font-bold tracking-widest text-xs uppercase">
                YOUR PERSONALIZED READING IS READY
              </motion.p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {showDemo && <InteractiveDemoModal onClose={() => setShowDemo(false)} />}
    </div>
  );
};

export default AnimatedHero;
