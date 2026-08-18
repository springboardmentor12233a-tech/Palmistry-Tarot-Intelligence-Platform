import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPalmScanner = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [phase, setPhase] = useState(0);

  // Mouse Parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Timeline orchestration
  useEffect(() => {
    const timer1 = setTimeout(() => setPhase(1), 1000); // 1s: Palm Formation
    const timer2 = setTimeout(() => setPhase(2), 2500); // 2.5s: Landmarks
    const timer3 = setTimeout(() => setPhase(3), 4000); // 4s: Palm Scan
    const timer4 = setTimeout(() => setPhase(4), 6000); // 6s: AI Analysis
    return () => { clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(timer4); };
  }, []);

  // MediaPipe-style simplified landmarks
  const landmarks = [
    {cx: 100, cy: 250}, // Wrist
    {cx: 60, cy: 150}, {cx: 50, cy: 100}, {cx: 40, cy: 60}, // Thumb
    {cx: 80, cy: 130}, {cx: 75, cy: 70}, {cx: 70, cy: 30}, // Index
    {cx: 110, cy: 120}, {cx: 115, cy: 50}, {cx: 120, cy: 10}, // Middle
    {cx: 140, cy: 130}, {cx: 150, cy: 70}, {cx: 160, cy: 40}, // Ring
    {cx: 170, cy: 160}, {cx: 180, cy: 120}, {cx: 190, cy: 90}, // Pinky
  ];

  return (
    <div className="relative w-full h-full min-h-[500px] flex items-center justify-center pointer-events-none select-none">
      
      {/* 3D Parallax Container */}
      <motion.div 
        animate={{ x: mousePos.x * -5, y: mousePos.y * -5 }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className="relative w-full max-w-[450px] aspect-square flex items-center justify-center"
      >
        
        {/* Intro Text (Phase 0-1) */}
        <AnimatePresence>
          {phase === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute text-cyan-500 tracking-[0.5em] text-xs font-bold font-mono"
            >
              AI PALM VISION
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Holographic Palm (Phase 1+) */}
        <motion.div 
          initial={{ opacity: 0, filter: 'blur(20px)' }}
          animate={phase >= 1 ? { opacity: 1, filter: 'blur(0px)' } : {}}
          transition={{ duration: 1.5 }}
          className="relative w-[250px] h-[380px] z-20"
        >
          {/* Real Hand Image Silhouette */}
          <div className="absolute inset-0 bg-[url('/palm-silhouette.png')] bg-contain bg-no-repeat bg-center opacity-80 mix-blend-screen drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"></div>
          
          {/* Background Glow */}
          <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute inset-0 bg-blue-600/5 rounded-[100px] blur-2xl"></div>

          {/* Landmarks (Phase 2+) */}
          {phase >= 2 && (
            <svg viewBox="0 0 250 380" className="absolute inset-0 w-full h-full drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] z-30">
              {landmarks.map((pt, i) => (
                <motion.circle 
                  key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#22d3ee"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, type: 'spring' }}
                />
              ))}
              {/* Abstract Connections */}
              <motion.path 
                d="M 100,250 L 60,150 L 50,100 M 100,250 L 80,130 L 75,70 M 100,250 L 110,120 L 115,50 M 100,250 L 140,130 L 150,70 M 100,250 L 170,160 L 180,120"
                fill="none" stroke="#22d3ee" strokeWidth="1" opacity="0.4"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </svg>
          )}

          {/* Scanning Beam & Lines (Phase 3+) */}
          {phase >= 3 && (
            <>
              {/* Beam */}
              <motion.div 
                initial={{ top: '0%', opacity: 0 }}
                animate={{ top: '100%', opacity: [0, 1, 1, 0] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity }}
                className="absolute left-[-20%] right-[-20%] h-[2px] bg-cyan-300 shadow-[0_0_20px_#67e8f9] z-40"
              />
              {/* Palm Lines drawing out as beam passes */}
              <svg viewBox="0 0 250 380" className="absolute inset-0 w-full h-full drop-shadow-[0_0_10px_rgba(56,189,248,0.9)] z-30">
                <motion.path 
                  d="M 50,130 Q 120,150 200,100" fill="transparent" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }}
                />
                <motion.path 
                  d="M 50,170 Q 120,190 180,240" fill="transparent" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }}
                />
                <motion.path 
                  d="M 50,170 Q 80,250 120,320" fill="transparent" stroke="#c084fc" strokeWidth="2.5" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.5 }}
                />
              </svg>
            </>
          )}

          {/* Labels */}
          {phase >= 2 && (
            <motion.div initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} className="absolute top-[80px] -right-16 text-[9px] text-cyan-300 font-mono border border-cyan-500/30 bg-gray-950/80 px-2 py-1 rounded backdrop-blur">HAND DETECTED</motion.div>
          )}
          {phase >= 3 && (
            <>
              <motion.div initial={{opacity:0, x: 10}} animate={{opacity:1, x:0}} transition={{delay: 0.5}} className="absolute top-[120px] -left-20 text-[9px] text-blue-300 font-mono">HEART LINE</motion.div>
              <motion.div initial={{opacity:0, x: -10}} animate={{opacity:1, x:0}} transition={{delay: 1.5}} className="absolute bottom-[60px] -right-8 text-[9px] text-purple-300 font-mono">LIFE LINE</motion.div>
            </>
          )}
        </motion.div>
        
        {/* Supporting Tarot Cards (Parallax offset) */}
        <motion.div 
          animate={{ x: mousePos.x * 12, y: mousePos.y * 12 }}
          transition={{ type: 'spring', stiffness: 40, damping: 20 }}
          className="absolute inset-0 z-10"
        >
          {/* Upper Left Card */}
          <motion.div 
            initial={{ opacity: 0, y: -20, rotate: -20 }}
            animate={{ opacity: 0.6, y: 0, rotate: -15 }}
            transition={{ duration: 2 }}
            className="absolute top-[15%] left-[5%] w-[70px] h-[110px] rounded border border-blue-500/30 bg-gray-800/80 backdrop-blur shadow-[0_0_15px_rgba(59,130,246,0.1)]"
          >
            <div className="w-full h-full border border-gray-600 m-[1px] rounded-sm bg-[url('https://upload.wikimedia.org/wikipedia/commons/d/de/RWS_Tarot_01_Magician.jpg')] bg-cover opacity-50"></div>
          </motion.div>

          {/* Lower Right Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20, rotate: 20 }}
            animate={{ opacity: 0.6, y: 0, rotate: 15 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute bottom-[20%] right-[5%] w-[80px] h-[130px] rounded border border-purple-500/30 bg-gray-800/80 backdrop-blur shadow-[0_0_15px_rgba(168,85,247,0.1)]"
          >
            <div className="w-full h-full border border-gray-600 m-[1px] rounded-sm bg-[url('https://upload.wikimedia.org/wikipedia/commons/9/90/RWS_Tarot_00_Fool.jpg')] bg-cover opacity-50"></div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPalmScanner;
