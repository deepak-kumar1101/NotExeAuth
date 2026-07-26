import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
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
    } catch (err) {
      setError('Failed to send reset email.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden overflow-y-auto bg-[#06070a] text-white selection:bg-indigo-500/30 font-sans">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="grid-bg opacity-30" />
      </div>

      <div className="w-full max-w-md px-4 py-12 relative z-20 animate-fade-in my-auto">
        <Link to="/login" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={15} /> Back to Login
        </Link>

        <div className="glass-card-premium p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-3xl glass-reflection">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

          {sent ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={32} className="text-emerald-400" />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Check Your Email</h2>
              <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                If an account exists for that email, password recovery instructions have been dispatched.
              </p>
              <div className="pt-2">
                <Link to="/login" className="btn-magnetic-primary inline-flex items-center justify-center w-full py-3 text-xs font-extrabold uppercase tracking-wider">
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-white via-indigo-100 to-indigo-300 text-black mb-4 shadow-lg shadow-white/20">
                  <span className="font-black text-sm tracking-tighter">DXA</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">Reset Password</h1>
                <p className="text-slate-400 text-xs font-medium">Enter your email address to receive password recovery instructions</p>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2.5 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleReset} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 block ml-1">Email Address</label>
                  <div className="relative group">
                    <input 
                      name="email" 
                      type="email" 
                      required 
                      placeholder="name@example.com" 
                      className="w-full bg-[#080a10] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pl-11 shadow-inner" 
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={17} />
                  </div>
                </div>

                <button 
                  disabled={loading} 
                  type="submit" 
                  className="btn-magnetic-primary h-12 w-full text-xs tracking-wider uppercase font-extrabold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Reset Link'}
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
