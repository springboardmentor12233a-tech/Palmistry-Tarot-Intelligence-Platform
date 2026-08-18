import React, { useEffect, useRef } from "react";
import "../styles/CosmicBackground.css";

const CosmicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let animationFrame;
    let width = 0;
    let height = 0;

    /*
     * Current mouse position
     */
    const mouse = {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
    };

    const stars = [];

    const STAR_COUNT = 150;

    /*
     * -------------------------------------------------------
     * CREATE CANVAS
     * -------------------------------------------------------
     */

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createStars();
    };

    /*
     * -------------------------------------------------------
     * CREATE STARS
     * -------------------------------------------------------
     */

    const createStars = () => {
      stars.length = 0;

      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          baseX: Math.random() * width,
          baseY: Math.random() * height,

          x: 0,
          y: 0,

          size: Math.random() * 1.7 + 0.35,

          /*
           * Different depth for every star.
           * Larger depth = stronger mouse movement.
           */
          depth: Math.random() * 0.9 + 0.1,

          opacity: Math.random() * 0.45 + 0.3,

          /*
           * Very slow natural movement
           */
          driftX: (Math.random() - 0.5) * 0.08,
          driftY: (Math.random() - 0.5) * 0.08,

          /*
           * Subtle twinkle
           */
          twinkleOffset:
            Math.random() * Math.PI * 2,

          color:
            Math.random() > 0.78
              ? "gold"
              : Math.random() > 0.5
              ? "blue"
              : "white",
        });

        stars[i].x = stars[i].baseX;
        stars[i].y = stars[i].baseY;
      }
    };

    /*
     * -------------------------------------------------------
     * DRAW STAR
     * -------------------------------------------------------
     */

    const drawStar = (star, time) => {
      /*
       * Very subtle twinkle.
       * This is intentionally much weaker than before.
       */
      const twinkle =
        Math.sin(
          time * 0.0012 +
            star.twinkleOffset
        ) * 0.08;

      const alpha = Math.max(
        0.15,
        Math.min(
          0.95,
          star.opacity + twinkle
        )
      );

      let color;

      if (star.color === "gold") {
        color = `rgba(245, 196, 81, ${alpha})`;
      } else if (star.color === "blue") {
        color = `rgba(91, 164, 255, ${alpha})`;
      } else {
        color = `rgba(225, 233, 255, ${alpha})`;
      }

      /*
       * Main star
       */
      ctx.beginPath();

      ctx.arc(
        star.x,
        star.y,
        star.size,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = color;
      ctx.fill();

      /*
       * Very soft glow
       */
      if (star.size > 1.35) {
        ctx.beginPath();

        ctx.arc(
          star.x,
          star.y,
          star.size * 3,
          0,
          Math.PI * 2
        );

        if (star.color === "gold") {
          ctx.fillStyle = `rgba(
            245,
            196,
            81,
            ${alpha * 0.10}
          )`;
        } else {
          ctx.fillStyle = `rgba(
            91,
            164,
            255,
            ${alpha * 0.06}
          )`;
        }

        ctx.fill();
      }
    };

    /*
     * -------------------------------------------------------
     * CONSTELLATION CONNECTIONS
     * -------------------------------------------------------
     */

    const drawConnections = () => {
      const maxDistance = 125;

      for (
        let i = 0;
        i < stars.length;
        i++
      ) {
        for (
          let j = i + 1;
          j < stars.length;
          j++
        ) {
          const a = stars[i];
          const b = stars[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;

          const distance = Math.sqrt(
            dx * dx + dy * dy
          );

          if (distance < maxDistance) {
            const opacity =
              (1 -
                distance /
                  maxDistance) *
              0.08;

            ctx.beginPath();

            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);

            ctx.strokeStyle = `rgba(
              110,
              145,
              220,
              ${opacity}
            )`;

            ctx.lineWidth = 0.45;

            ctx.stroke();
          }
        }
      }
    };

    /*
     * -------------------------------------------------------
     * ANIMATION
     * -------------------------------------------------------
     */

    const animate = (time) => {
      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      /*
       * Smooth mouse movement.
       */
      mouse.x +=
        (mouse.targetX - mouse.x) *
        0.045;

      mouse.y +=
        (mouse.targetY - mouse.y) *
        0.045;

      stars.forEach((star) => {
        /*
         * Natural slow movement
         */
        star.baseX += star.driftX;
        star.baseY += star.driftY;

        /*
         * Wrap around screen
         */
        if (star.baseX < -30) {
          star.baseX = width + 30;
        }

        if (star.baseX > width + 30) {
          star.baseX = -30;
        }

        if (star.baseY < -30) {
          star.baseY = height + 30;
        }

        if (star.baseY > height + 30) {
          star.baseY = -30;
        }

        /*
         * ---------------------------------------------------
         * GLOBAL MOUSE PARALLAX
         * ---------------------------------------------------
         */

        const mouseOffsetX =
          (mouse.x - 0.5) *
          55 *
          star.depth;

        const mouseOffsetY =
          (mouse.y - 0.5) *
          35 *
          star.depth;

        const targetX =
          star.baseX +
          mouseOffsetX;

        const targetY =
          star.baseY +
          mouseOffsetY;

        /*
         * Smooth star movement
         */
        star.x +=
          (targetX - star.x) *
          0.035;

        star.y +=
          (targetY - star.y) *
          0.035;
      });

      /*
       * Draw constellation lines first
       */
      drawConnections();

      /*
       * Draw stars
       */
      stars.forEach((star) => {
        drawStar(star, time);
      });

      animationFrame =
        requestAnimationFrame(animate);
    };

    /*
     * -------------------------------------------------------
     * MOUSE
     * -------------------------------------------------------
     */

    const handleMouseMove = (event) => {
      mouse.targetX =
        event.clientX / width;

      mouse.targetY =
        event.clientY / height;
    };

    /*
     * -------------------------------------------------------
     * EVENTS
     * -------------------------------------------------------
     */

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    window.addEventListener(
      "mousemove",
      handleMouseMove
    );

    /*
     * Start
     */
    resizeCanvas();

    animationFrame =
      requestAnimationFrame(animate);

    /*
     * Cleanup
     */
    return () => {
      cancelAnimationFrame(
        animationFrame
      );

      window.removeEventListener(
        "resize",
        resizeCanvas
      );

      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
    };
  }, []);

  return (
    <div className="cosmic-background">

      <div className="cosmic-nebula cosmic-nebula-one"></div>

      <div className="cosmic-nebula cosmic-nebula-two"></div>

      <div className="cosmic-nebula cosmic-nebula-three"></div>

      <canvas
        ref={canvasRef}
        className="cosmic-star-canvas"
      />

      <div className="cosmic-vignette"></div>

    </div>
  );
};

export default CosmicBackground;