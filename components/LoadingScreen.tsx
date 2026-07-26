import React from 'react';
import BrandMark from './BrandMark';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Initializing Security System' }) => {
  return (
    <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#07080c] overflow-hidden select-none">
      {/* Dynamic Background Glows */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[150px] animate-pulse-glow" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-purple-600/10 blur-[140px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Grid Overlay */}
      <div className="grid-bg" />

      <div className="relative z-10 flex flex-col items-center max-w-sm text-center px-6">
        {/* Animated Brand Logo Container */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 blur-md animate-pulse-ring" />

          {/* Frosted Glass Shield Card */}
          <div className="relative p-6 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-2xl shadow-2xl glass-reflection">
            <BrandMark size="lg" animated />
          </div>
        </div>

        {/* Animated Loading Text */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>DEEP X AUTH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
          </h2>

          <p className="text-xs font-mono tracking-widest text-slate-400 uppercase">
            {message}
          </p>

          {/* Progress Bar */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto mt-4">
            <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full animate-gradient-flow w-full origin-left scale-x-100 transition-transform duration-1000" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
