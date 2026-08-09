import React, { useRef, useEffect, useState } from 'react';

const AuraReveal = ({ base64Image, cardName, onRevealComplete }) => {
  const canvasRef = useRef(null);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleFullReveal = () => {
    setIsRevealed(true);
    if (onRevealComplete) {
      onRevealComplete();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    // willReadFrequently optimizes the performance of getImageData
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let isDrawing = false;
    let scratchCounter = 0;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw the Fog
    ctx.fillStyle = '#1a0b2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw the Stardust
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 150; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // THE 30% CLEAR LOGIC
    const checkClearPercentage = () => {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      let transparentPixels = 0;
      
      // Check every 4th value (Alpha channel). If it's 0, it has been scratched away.
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
      }
      
      const totalPixels = pixels.length / 4;
      if (transparentPixels / totalPixels >= 0.30) {
        handleFullReveal(); // Boom! 30% reached, auto-reveal!
      }
    };

    const startDrawing = (e) => { isDrawing = true; erase(e); };
    const stopDrawing = () => { 
        isDrawing = false; 
        checkClearPercentage(); // Check when they lift their finger
    };
    
    const erase = (e) => {
      if (!isDrawing) return;
      e.preventDefault();

      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      const brushRadius = 40;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, brushRadius);
      gradient.addColorStop(0, 'rgba(0,0,0,1)');
      gradient.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
      ctx.fill();

      // Check occasionally while dragging so it pops before they even let go
      scratchCounter++;
      if (scratchCounter % 15 === 0) {
         checkClearPercentage();
      }
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', erase);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', erase, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', erase);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', erase);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [isRevealed]);

  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <h3 style={{ 
        opacity: isRevealed ? 1 : 0, 
        transition: 'opacity 1s ease', 
        margin: '0 0 10px 0',
        height: '24px'
      }}>
        {cardName}
      </h3>
      <div style={{ 
        position: 'relative', 
        width: '240px', 
        height: '400px', 
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        margin: '0 auto'
      }}>
        <img 
          src={`data:image/jpeg;base64,${base64Image}`} 
          alt="Tarot Card" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair',
            transition: 'opacity 1.5s ease-out',
            opacity: isRevealed ? 0 : 1,
            pointerEvents: isRevealed ? 'none' : 'auto'
          }}
        />
      </div>
    </div>
  );
};

export default AuraReveal;
