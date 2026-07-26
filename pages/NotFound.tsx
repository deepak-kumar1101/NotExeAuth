import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import BrandMark from '../components/BrandMark';

export const NotFound: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#07080c] px-4 overflow-hidden select-none">
      {/* Dynamic Background Lights */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[160px] top-1/4 left-1/4 animate-pulse-glow" />
      <div className="absolute w-[450px] h-[450px] rounded-full bg-rose-600/10 blur-[150px] bottom-1/4 right-1/4 animate-pulse-glow" style={{ animationDelay: '3s' }} />

      <div className="grid-bg" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-white/10 backdrop-blur-3xl shadow-2xl glass-reflection">
        <div className="flex justify-center">
          <BrandMark size="md" />
        </div>

        {/* 404 Neon Code */}
        <div className="relative">
          <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 tracking-tighter drop-shadow-[0_0_35px_rgba(99,102,241,0.3)]">
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Path Not Authorized</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lost in Cyberspace?
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            The encrypted path or application resource you requested does not exist or has been relocated within the cluster.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white text-slate-950 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all transform hover:scale-105 shadow-xl"
          >
            <Home className="w-4 h-4" />
            <span>Return to Safety</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
