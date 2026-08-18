import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key } from 'lucide-react';

const DoorLockAnimation = ({ userName, role = "User" }) => {
  const [stage, setStage] = useState('open'); // open, closing, locking, locked

  useEffect(() => {
    // Sequence of animations
    const seq = async () => {
      // 1. Wait a moment
      await new Promise(r => setTimeout(r, 500));
      // 2. Close Doors
      setStage('closing');
      await new Promise(r => setTimeout(r, 2000));
      // 3. Insert Key & turn to lock
      setStage('locking');
      await new Promise(r => setTimeout(r, 2000));
      // 4. Locked state
      setStage('locked');
    };
    seq();
  }, []);

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden perspective-[1000px]">
      
      {/* Background Goodbye Text (Behind the doors) */}
      <motion.div 
        initial={{ opacity: 1, scale: 1 }}
        animate={{ 
          opacity: stage === 'open' ? 1 : 0, 
          scale: stage === 'open' ? 1 : 0.8 
        }}
        transition={{ duration: 1.5, ease: "easeIn" }}
        className="absolute inset-0 flex flex-col items-center justify-center z-0"
      >
        <div className="w-24 h-24 rounded-full border border-red-400 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(239,68,68,0.3)] bg-red-900/20 backdrop-blur-md overflow-hidden relative">
            <motion.div 
                animate={{ rotate: -360 }} 
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(239,68,68,0.8)_360deg)]"
            />
            <div className="absolute inset-1 bg-[#0f0c1e] rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            </div>
        </div>
        <motion.div
          initial={{ rotateX: 0, scale: 1, y: 0 }}
          animate={{ 
            rotateX: stage === 'open' ? 0 : 60, 
            scale: stage === 'open' ? 1 : 0.5,
            y: stage === 'open' ? 0 : 50
          }}
          transition={{ duration: 1.5, type: "spring", bounce: 0.5 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="flex flex-col items-center"
        >
          <h3 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-pink-500 to-purple-500 tracking-[0.1em] mb-2 uppercase text-center drop-shadow-[0_10px_20px_rgba(239,68,68,0.6)]">
            Goodbye, {userName || role}
          </h3>
          <p className="text-lg text-red-300/90 uppercase tracking-widest drop-shadow-[0_5px_10px_rgba(0,0,0,0.8)]">YOU ARE BEING LOGGED OUT</p>
        </motion.div>
      </motion.div>

      {/* 3D Doors */}
      <AnimatePresence>
        {(stage === 'open' || stage === 'closing' || stage === 'locking' || stage === 'locked') && (
          <motion.div 
            initial={{ opacity: 1, z: 0 }}
            animate={{ 
              opacity: 1,
              z: 0
            }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex z-10 preserve-3d"
          >
            {/* Left Door */}
            <motion.div 
              initial={{ rotateY: -105 }}
              animate={{ rotateY: stage === 'closing' || stage === 'locked' ? 0 : -105 }}
              transition={{ duration: 2.0, ease: "easeInOut" }}
              style={{ transformOrigin: "left center" }}
              className="w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop')] bg-[length:200%_100%] bg-left border-r-2 border-[#d4af37]/50 shadow-[inset_-20px_0_50px_rgba(0,0,0,0.9)] flex justify-end items-center relative overflow-hidden"
            >
              {/* Mystical Overlay */}
              <div className="absolute inset-0 bg-purple-900/40 mix-blend-multiply"></div>
              {/* Golden Ornaments */}
              <div className="absolute inset-4 border border-[#d4af37]/30 rounded-lg"></div>
              <div className="absolute inset-8 border border-[#d4af37]/20 rounded-md"></div>
              
              {/* Keyhole Half */}
              <div className="w-8 h-24 bg-black rounded-l-full translate-x-[2px] z-20 shadow-[inset_-4px_0_15px_rgba(0,0,0,1),0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-end overflow-hidden border-y border-l border-[#d4af37]/50">
                 <div className="w-1.5 h-6 bg-red-400 mr-2 rounded-full shadow-[0_0_15px_#f87171]"></div>
              </div>
            </motion.div>

            {/* Right Door */}
            <motion.div 
              initial={{ rotateY: 105 }}
              animate={{ rotateY: stage === 'closing' || stage === 'locked' ? 0 : 105 }}
              transition={{ duration: 2.0, ease: "easeInOut" }}
              style={{ transformOrigin: "right center" }}
              className="w-1/2 h-full bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop')] bg-[length:200%_100%] bg-right border-l-2 border-[#d4af37]/50 shadow-[inset_20px_0_50px_rgba(0,0,0,0.9)] flex justify-start items-center relative overflow-hidden"
            >
              {/* Mystical Overlay */}
              <div className="absolute inset-0 bg-purple-900/40 mix-blend-multiply"></div>
              {/* Golden Ornaments */}
              <div className="absolute inset-4 border border-[#d4af37]/30 rounded-lg"></div>
              <div className="absolute inset-8 border border-[#d4af37]/20 rounded-md"></div>

              {/* Keyhole Half */}
              <div className="w-8 h-24 bg-black rounded-r-full -translate-x-[2px] z-20 shadow-[inset_4px_0_15px_rgba(0,0,0,1),0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-start overflow-hidden border-y border-r border-[#d4af37]/50">
                 <div className="w-1.5 h-6 bg-red-400 ml-2 rounded-full shadow-[0_0_15px_#f87171]"></div>
              </div>
            </motion.div>

            {/* The Key Animation (Locking) */}
            <AnimatePresence>
              {stage === 'locking' && (
                <motion.div
                  initial={{ opacity: 0, scale: 1, z: 0, rotate: 45 }}
                  animate={{ 
                    opacity: [0, 1, 1, 0], 
                    scale: [1, 1, 1, 0.5], 
                    z: [0, 0, 0, -100],
                    rotate: [ 45, 45, -45, -45 ],
                    filter: ["brightness(1)", "brightness(2)", "brightness(1)", "brightness(1)"]
                  }}
                  transition={{ 
                    duration: 2.0,
                    times: [0, 0.2, 0.7, 1]
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                >
                  <Key size={32} />
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoorLockAnimation;
