import React, { useEffect, useState } from 'react';

export const CursorGlow: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only enable on pointer-fine devices to preserve mobile performance
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let requestId: number;
    let targetX = -100;
    let targetY = -100;
    let currentX = -100;
    let currentY = -100;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const animate = () => {
      // Smooth lerp for liquid motion
      currentX += (targetX - currentX) * 0.15;
      currentY += (targetY - currentY) * 0.15;

      setPosition({ x: currentX, y: currentY });
      requestId = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    requestId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(requestId);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed z-[9999] transition-opacity duration-500 hidden md:block"
      style={{
        left: 0,
        top: 0,
        transform: `translate3d(${position.x - 200}px, ${position.y - 200}px, 0)`,
        opacity: visible ? 0.35 : 0,
        willChange: 'transform'
      }}
    >
      <div className="w-[400px] h-[400px] rounded-full bg-radial from-indigo-500/30 via-purple-500/10 to-transparent blur-[80px]" />
    </div>
  );
};

export default CursorGlow;
