import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CosmicAuthBackground = ({ mode = 'login' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const newParticles = Array.from({ length: mode === 'register' ? 70 : 50 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + (mode === 'register' ? 1.5 : 1),
      opacity: Math.random() * 0.8 + 0.2,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    }));
    setParticles(newParticles);
  }, [mode]);

  const isLogin = mode === 'login';

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#07050f]">
      {/* Base Gradient */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] ${isLogin ? 'from-cyan-900/20 via-[#07050f] to-[#07050f]' : 'from-purple-900/20 via-[#07050f] to-[#07050f]'}`}></div>
      
      {/* Particles */}
      <div className="absolute inset-0">
        {particles.map((p, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute rounded-full ${isLogin ? 'bg-cyan-100' : 'bg-yellow-100'}`}
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
              boxShadow: isLogin ? '0 0 4px rgba(34,211,238,0.4)' : '0 0 5px rgba(250,204,21,0.4)'
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, 15, 0],
              opacity: [p.opacity, p.opacity * 0.3, p.opacity]
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>
      
      {/* Nebula Glows */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className={`absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] ${isLogin ? 'bg-blue-900/20' : 'bg-purple-900/30'}`}
      />
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className={`absolute bottom-1/4 right-1/4 w-[700px] h-[700px] rounded-full blur-[150px] ${isLogin ? 'bg-cyan-900/20' : 'bg-pink-900/20'}`}
      />
    </div>
  );
};

export default CosmicAuthBackground;
