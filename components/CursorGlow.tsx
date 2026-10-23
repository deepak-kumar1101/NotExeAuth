import React, { useEffect, useRef } from 'react';

export const CursorGlow: React.FC = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop pointer-fine devices to preserve mobile performance
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;

    let targetX = -200;
    let targetY = -200;
    let currentX = -200;
    let currentY = -200;
    let animId: number;
    let isVisible = false;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!isVisible && glowRef.current) {
        isVisible = true;
        glowRef.current.style.opacity = '1';
      }
    };

    const onMouseLeave = () => {
      isVisible = false;
      if (glowRef.current) {
        glowRef.current.style.opacity = '0';
      }
    };

    // Smooth lerp loop mutating transform directly on the DOM element
    // NO React state updates, zero re-renders!
    const render = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${currentX - 160}px, ${currentY - 160}px, 0)`;
      }
      animId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 z-[9999] opacity-0 transition-opacity duration-300 hidden md:block"
      style={{
        width: '320px',
        height: '320px',
        willChange: 'transform',
        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(6, 182, 212, 0.05) 45%, transparent 70%)',
        borderRadius: '50%',
      }}
    />
  );
};

export default CursorGlow;
