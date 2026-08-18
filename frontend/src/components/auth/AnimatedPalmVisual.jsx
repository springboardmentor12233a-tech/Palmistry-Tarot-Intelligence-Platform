import React from 'react';
import { motion } from 'framer-motion';

const AnimatedPalmVisual = ({ mode = "login" }) => {
  // If mode is register, elements orbit. If login, they are static/floating.
  
  const orbitTransition = {
    animate: { rotate: 360 },
    transition: { duration: 40, repeat: Infinity, ease: "linear" }
  };
  
  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center pointer-events-none select-none">
      
      {/* Container - orbits if mode is register */}
      <motion.div 
        {...(mode === 'register' ? orbitTransition : {})}
        className="relative w-full max-w-[400px] aspect-square flex items-center justify-center"
      >
        {/* Holographic Palm */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="relative w-[200px] h-[300px] bg-[url('/palm-silhouette.png')] bg-contain bg-no-repeat bg-center opacity-70 z-10"
          style={mode === 'register' ? { rotate: -360 } : {}} // counter-rotate to stay upright if orbiting
        >
          {/* Fallback glow if no image */}
          <div className="absolute inset-0 bg-blue-500/20 rounded-[100px] blur-2xl"></div>
          
          {/* Scanning Beam (Login only for dramatic effect) */}
          {mode === 'login' && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20"
            />
          )}

          {/* Simple Palm Lines */}
          <svg viewBox="0 0 200 300" className="absolute inset-0 w-full h-full drop-shadow-[0_0_5px_rgba(59,130,246,0.8)]">
            <motion.path 
              d="M 40,100 Q 100,120 160,80" 
              fill="transparent" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1 }}
            />
            <motion.path 
              d="M 40,140 Q 100,160 150,200" 
              fill="transparent" stroke="#818cf8" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 1.5 }}
            />
            <motion.path 
              d="M 40,140 Q 70,220 100,280" 
              fill="transparent" stroke="#c084fc" strokeWidth="2" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, delay: 2 }}
            />
          </svg>
          
          {/* Tiny Labels */}
          {mode === 'login' && (
            <>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:2.5}} className="absolute top-[80px] -right-4 text-[8px] text-cyan-300 font-mono">HAND DETECTED</motion.div>
              <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:3.0}} className="absolute bottom-[40px] -left-4 text-[8px] text-purple-300 font-mono">AI VISION</motion.div>
            </>
          )}
        </motion.div>

        {/* Floating Tarot Cards */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
          transition={{ opacity: { duration: 1, delay: 1 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute -left-4 top-[10%] w-[80px] h-[130px] rounded border border-purple-500/30 bg-gray-800/80 backdrop-blur z-20 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
          style={{ rotate: -15, ...(mode === 'register' ? { rotate: -375 } : {}) }}
        >
          <div className="w-full h-full border border-gray-600 m-[1px] rounded-sm bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg')] bg-cover"></div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
          transition={{ opacity: { duration: 1, delay: 1.2 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute -right-4 top-[30%] w-[90px] h-[140px] rounded border border-blue-500/30 bg-gray-800/80 backdrop-blur z-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          style={{ rotate: 10, ...(mode === 'register' ? { rotate: -350 } : {}) }}
        >
          <div className="w-full h-full border border-gray-600 m-[1px] rounded-sm bg-[url('https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg')] bg-cover"></div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default AnimatedPalmVisual;
