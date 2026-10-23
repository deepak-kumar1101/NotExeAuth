import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import BrandMark from '../components/BrandMark';

export const NotFound: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#07090e] px-4 overflow-hidden select-none">
      <div className="ambient-glow-top" />
      <div className="ambient-glow-bottom" />
      <div className="grid-cyber-bg" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-8 p-8 sm:p-12 rounded-3xl glass-card-premium border border-white/10 shadow-2xl">
        <div className="flex justify-center">
          <BrandMark size="md" />
        </div>

        {/* 404 Neon Code */}
        <div className="relative">
          <span className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600 tracking-tighter drop-shadow-[0_0_35px_rgba(245,158,11,0.3)]">
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Path Not Authorized</span>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Lost in the Encrypted Cluster?
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            The encrypted path or application resource you requested does not exist or has been relocated within the Not Exe cluster.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="btn-magnetic-primary w-full sm:w-auto px-6 py-3.5 text-xs uppercase font-black flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Return to Portal</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-magnetic-glass w-full sm:w-auto px-6 py-3.5 text-xs uppercase font-bold flex items-center justify-center gap-2"
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
