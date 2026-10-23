import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Establishing Encrypted Session' }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07090e] overflow-hidden select-none">
      {/* High-performance ambient gradients */}
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />
      <div className="grid-cyber-bg" />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6">
        {/* Animated Brand Circular Logo */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 opacity-60 blur-md animate-pulse" />
          <div className="relative w-20 h-20 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-cyan-400 shadow-[0_0_30px_rgba(245,158,11,0.5)]">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Not Exe"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Brand Title */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-white">
              NOT<span className="text-amber-400 ml-1">EXE</span>
            </span>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30">
              SHIELD
            </span>
          </div>

          <p className="text-[11px] font-mono tracking-widest text-slate-400 uppercase pt-1">
            {message}
          </p>

          {/* Progress Bar */}
          <div className="w-44 h-1 bg-white/10 rounded-full overflow-hidden mx-auto mt-4">
            <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-cyan-400 rounded-full animate-pulse w-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
