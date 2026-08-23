'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  driftX: number;
  driftY: number;
  color: string;
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate stars
    const starCount = Math.min(180, Math.floor((width * height) / 9000));
    const stars: Star[] = [];
    const colors = [
      'rgba(245, 243, 250, ', // Off-white
      'rgba(201, 184, 240, ', // Lavender
      'rgba(232, 196, 104, ', // Gold
      'rgba(167, 139, 250, ', // Violet
    ];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        twinkleSpeed: (Math.random() * 0.02 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        driftX: (Math.random() - 0.5) * 0.08,
        driftY: (Math.random() - 0.5) * 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let tick = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw faint nebular ambient glows
      const grad1 = ctx.createRadialGradient(
        width * 0.2,
        height * 0.3,
        20,
        width * 0.2,
        height * 0.3,
        width * 0.5
      );
      grad1.addColorStop(0, 'rgba(124, 58, 237, 0.07)'); // Violet glow
      grad1.addColorStop(1, 'rgba(10, 10, 24, 0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      const grad2 = ctx.createRadialGradient(
        width * 0.8,
        height * 0.7,
        30,
        width * 0.8,
        height * 0.7,
        width * 0.6
      );
      grad2.addColorStop(0, 'rgba(212, 175, 55, 0.04)'); // Gold glow
      grad2.addColorStop(1, 'rgba(10, 10, 24, 0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      // Render & update stars
      tick += 0.02;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];

        // Twinkle
        s.alpha += s.twinkleSpeed;
        if (s.alpha > 0.85 || s.alpha < 0.15) {
          s.twinkleSpeed = -s.twinkleSpeed;
        }

        // Slow drift
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;
        if (s.y < 0) s.y = height;
        if (s.y > height) s.y = 0;

        ctx.fillStyle = `${s.color}${Math.max(0.1, s.alpha)})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();

        // Extra soft star glare on larger stars
        if (s.size > 1.4 && s.alpha > 0.6) {
          ctx.strokeStyle = `${s.color}${s.alpha * 0.3})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - 3, s.y);
          ctx.lineTo(s.x + 3, s.y);
          ctx.moveTo(s.x, s.y - 3);
          ctx.lineTo(s.x, s.y + 3);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
    />
  );
}
