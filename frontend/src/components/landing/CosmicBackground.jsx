import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const CosmicBackground = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 2000], [0, -200]);
  
  const [stars, setStars] = useState([]);

  useEffect(() => {
    // Generate static stars to prevent re-renders changing positions
    const newStars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      opacity: Math.random(),
      delay: Math.random() * 2
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-gray-950">
      
      {/* Deep Space Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950"></div>
      
      {/* Stars Layer (Parallax Down) */}
      <motion.div style={{ y: y1 }} className="absolute inset-0">
        {stars.slice(0, 75).map((star, i) => (
          <motion.div
            key={`star-1-${i}`}
            className="absolute bg-white rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity
            }}
            animate={{ opacity: [star.opacity, star.opacity * 0.3, star.opacity] }}
            transition={{ duration: 3, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* Foreground Stars / Dust (Parallax Up) */}
      <motion.div style={{ y: y2 }} className="absolute inset-0">
        {stars.slice(75, 150).map((star, i) => (
          <motion.div
            key={`star-2-${i}`}
            className="absolute bg-indigo-200 rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size * 1.5,
              height: star.size * 1.5,
              opacity: star.opacity * 0.5
            }}
            animate={{ opacity: [star.opacity*0.5, 0, star.opacity*0.5] }}
            transition={{ duration: 4, delay: star.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </motion.div>
      
      {/* Nebula Glows */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 3, delay: 1 }}
        className="absolute top-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px]"
      />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 4, delay: 1.5 }}
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px]"
      />
    </div>
  );
};

export default CosmicBackground;
