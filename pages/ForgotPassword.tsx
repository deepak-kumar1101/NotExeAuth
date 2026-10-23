import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { auth } from '../services/firebase';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      console.error("Reset error:", err);
      setError('Failed to dispatch reset email. Please ensure the address is correct.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden bg-[#07090e] text-white selection:bg-amber-500/30 font-sans p-4">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-glow-top" />
        <div className="ambient-glow-bottom" />
        <div className="grid-cyber-bg" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in my-auto py-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Sign In</span>
        </Link>

        <div className="glass-card-premium p-8 md:p-9 rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-2xl glass-reflection">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Circular Not Exe Mascot Logo */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative group cursor-pointer mb-3">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-amber-400 to-cyan-400 opacity-60 blur-md group-hover:opacity-90 transition-opacity" />
              <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-cyan-400 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">
                  <img
                    src="/logo.png"
                    alt="Not Exe"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white">
                NOT<span className="text-amber-400 ml-1">EXE</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/30">
                RECOVERY
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium mt-1">Recover encrypted developer credentials</p>
          </div>

          {sent ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-amber-400/15 border border-amber-400/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <CheckCircle2 size={30} className="text-amber-400" />
              </div>
              <h2 className="text-xl font-black text-white">Check Your Inbox</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                If an account exists for that email, password recovery instructions have been dispatched.
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-magnetic-primary inline-flex items-center justify-center w-full py-3 text-xs font-black uppercase tracking-wider">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium p-3.5 rounded-xl mb-5 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block ml-1">Developer Email</label>
                  <div className="relative group">
                    <input 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="developer@studio.com" 
                      className="w-full bg-[#080b12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all pl-11 shadow-inner" 
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={16} />
                  </div>
                </div>

                <button 
                  disabled={loading} 
                  type="submit" 
                  className="btn-magnetic-primary w-full h-11 text-xs tracking-wider uppercase font-black flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      <span>Dispatch Recovery Link</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
