import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RegisterTarotPortal = () => {
  const [phase, setPhase] = useState(0);

  // Timeline
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 500); // 0.5s: Portal expands
    const timer2 = setTimeout(() => setPhase(2), 2000); // 2s: Cards emerge
    const timer3 = setTimeout(() => setPhase(3), 4000); // 4s: Card Reveal
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); };
  }, []);

  // Portal Rings
  const Ring = ({ size, duration, reverse, delay = 0 }) => (
    <motion.div 
      initial={{ scale: 0, opacity: 0 }}
      animate={phase >= 1 ? { scale: 1, opacity: 1, rotate: reverse ? -360 : 360 } : {}}
      transition={{ 
        scale: { duration: 1.5, delay },
        opacity: { duration: 1.5, delay },
        rotate: { duration, repeat: Infinity, ease: "linear" }
      }}
      className="absolute border border-purple-500/20 rounded-full flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <div className="w-[10%] h-[10%] bg-gold-400 rounded-full blur-[2px] opacity-30 absolute top-0"></div>
    </motion.div>
  );

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center pointer-events-none select-none">
      
      <div className="relative w-full max-w-[450px] aspect-square flex items-center justify-center">
        
        {/* The Cosmic Portal */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Ring size={200} duration={20} delay={0} />
          <Ring size={250} duration={25} reverse delay={0.2} />
          <Ring size={320} duration={35} delay={0.4} />
          
          {/* Inner Portal Glow */}
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={phase >= 1 ? { scale: 1, opacity: 0.8 } : {}}
            transition={{ duration: 2 }}
            className="absolute w-[150px] h-[150px] bg-purple-900/30 rounded-full blur-xl"
          ></motion.div>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={phase >= 1 ? { scale: 1, opacity: [0.5, 0.8, 0.5] } : {}}
            transition={{ scale: {duration: 2}, opacity: {duration: 3, repeat: Infinity} }}
            className="absolute w-[80px] h-[80px] bg-fuchsia-600/40 rounded-full blur-2xl"
          ></motion.div>
        </div>

        {/* Floating Tarot Deck (Phase 2+) */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.5, type: "spring", bounce: 0.4 }}
              className="relative w-[150px] h-[220px] z-20 flex items-center justify-center"
            >
              {/* Back Cards (Deck Illusion) */}
              <motion.div className="absolute w-[120px] h-[180px] rounded-lg border border-purple-500/40 bg-gray-900 shadow-xl" style={{ rotate: -15, left: 0 }}></motion.div>
              <motion.div className="absolute w-[120px] h-[180px] rounded-lg border border-purple-500/40 bg-gray-900 shadow-xl" style={{ rotate: 5, right: 0 }}></motion.div>
              <motion.div className="absolute w-[120px] h-[180px] rounded-lg border border-purple-500/40 bg-gray-900 shadow-xl" style={{ rotate: 20, right: -10 }}></motion.div>

              {/* Main Card (Phase 3 Reveal) */}
              <motion.div 
                initial={{ rotateY: 180, zIndex: 10 }}
                animate={phase >= 3 ? { rotateY: 0, scale: 1.1, y: -20, zIndex: 30 } : { rotateY: 180, scale: 1, y: 0 }}
                transition={{ duration: 1.5, type: "spring" }}
                className="absolute w-[130px] h-[200px] rounded-lg border border-gold-400/50 bg-gray-800 shadow-[0_0_30px_rgba(168,85,247,0.3)] transform-style-3d"
              >
                {/* Back of card (visible initially due to rotateY) */}
                <div className="absolute inset-0 backface-hidden bg-[url('/palm-silhouette.png')] bg-cover bg-center opacity-30 border border-gray-600 rounded-lg m-1" style={{transform: 'rotateY(180deg)'}}></div>
                
                {/* Front of card (visible after reveal) */}
                <div className="absolute inset-0 backface-hidden border border-gray-500 rounded-lg m-1 bg-[url('https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg')] bg-cover"></div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Orb Overlay */}
        {phase >= 1 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-[10%] right-[10%] w-16 h-16 z-40 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-md animate-pulse"></div>
            <motion.div animate={{rotate: 360}} transition={{duration: 10, repeat: Infinity, ease: "linear"}} className="absolute inset-2 border border-dashed border-yellow-200/50 rounded-full"></motion.div>
            <div className="w-4 h-4 bg-yellow-200 rounded-full shadow-[0_0_10px_#fef08a]"></div>
          </motion.div>
        )}

        {/* Message */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="absolute bottom-[-10%] text-purple-300 tracking-[0.3em] text-xs font-bold font-mono"
            >
              YOUR JOURNEY AWAITS
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default RegisterTarotPortal;
