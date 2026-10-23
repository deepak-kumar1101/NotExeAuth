import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { Mail, Lock, Loader2, ArrowLeft, Github, CheckCircle2, AlertCircle, Check, MessageSquare, ArrowRight } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { encrypt } from '../services/encryption';
import Turnstile from '../components/Turnstile';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { discordId } = useParams<{ discordId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agree, setAgree] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate('/dashboard');
    });
    return unsubscribe;
  }, [navigate]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;
    const confirm = data.get('confirm') as string;

    if (password !== confirm) return setError('Passwords do not match.');
    if (!agree) return setError('You must agree to the Terms of Service.');

    setLoading(true);
    setError('');

    if (!turnstileToken) {
      setError("Please complete the Cloudflare security verification.");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (res.user) {
        const secret = 'NXE-' + Math.random().toString(36).substring(2, 15).toUpperCase();
        const emailKey = email.replace(/\./g, ',');
        const customer = {
          email,
          secret,
          plan: 'Free Plan',
          credits: 0,
          discordId: discordId || '',
          createdAt: new Date().toISOString()
        };
        await set(ref(db, `customers/${emailKey}`), encrypt(customer));
      }

      if (discordId) {
        setShowSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Signup error details:", err);
      let msg = err.message || "Failed to create account.";
      if (err.code === "auth/email-already-in-use") msg = "Email already registered. Please sign in.";
      if (err.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      if (err.code === "auth/invalid-email") msg = "Invalid email address format.";
      if (err.code === "auth/operation-not-allowed") msg = "Email/Password sign-up is currently disabled.";
      if (err.message && err.message.includes("PERMISSION_DENIED")) msg = "Database Permission Denied. Please ensure rules are configured.";
      setError(msg);
    }
    setLoading(false);
  };

  const socialLogin = async (provider: any) => {
    if (!turnstileToken) {
      setError("Please complete the Cloudflare security verification first.");
      return;
    }

    try {
      const res = await signInWithPopup(auth, provider);

      if (res.user && res.user.email) {
        const emailKey = res.user.email.replace(/\./g, ',');
        const snap = await get(ref(db, `customers/${emailKey}`));

        if (!snap.exists()) {
          const secret = 'NXE-' + Math.random().toString(36).substring(2, 15).toUpperCase();
          const customer = {
            email: res.user.email,
            secret,
            plan: 'Free Plan',
            credits: 0,
            discordId: discordId || '',
            createdAt: new Date().toISOString()
          };
          await set(ref(db, `customers/${emailKey}`), encrypt(customer));
        }
      }

      if (discordId) {
        setShowSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError("Social sign-in failed. Please try again.");
    }
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
        {/* Navigation back */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Portal</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-[10px] font-mono text-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NODE SECURE</span>
          </div>
        </div>

        {/* Auth Glass Card */}
        <div className="glass-card-premium p-8 md:p-9 rounded-3xl border border-white/10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] relative overflow-hidden backdrop-blur-2xl glass-reflection">
          {/* Subtle Cyber Gold Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Glowing Circular Not Exe Mascot Logo */}
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
                SHIELD
              </span>
            </div>
            <p className="text-slate-400 text-xs font-medium mt-1">Deploy hardware-bound software licensing</p>
          </div>

          {/* Quick Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black/40 rounded-xl border border-white/5 mb-6 text-xs font-bold">
            <Link to="/login" className="py-2 rounded-lg text-slate-400 hover:text-white text-center transition-colors">
              Sign In
            </Link>
            <div className="py-2 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 text-center shadow-sm">
              Create Account
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-medium p-3.5 rounded-xl mb-5 flex items-start gap-2.5 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block ml-1">Password</label>
                <div className="relative group">
                  <input 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••••••" 
                    className="w-full bg-[#080b12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all pl-11 shadow-inner" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={16} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block ml-1">Confirm</label>
                <div className="relative group">
                  <input 
                    name="confirm" 
                    type="password" 
                    required 
                    placeholder="••••••••••••" 
                    className="w-full bg-[#080b12] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all pl-11 shadow-inner" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-400 transition-colors" size={16} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <div 
                  onClick={() => setAgree(!agree)} 
                  className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center mt-0.5 ${agree ? 'bg-amber-400 border-amber-400 text-black' : 'border-white/20 bg-[#080b12]'}`}
                >
                  {agree && <Check size={12} className="stroke-[3.5px]" />}
                </div>
                <span className="text-xs text-slate-400 leading-relaxed font-medium">
                  I agree to the <Link to="/tos" className="text-amber-400 hover:underline font-bold">Terms of Service</Link> and Security SLA.
                </span>
              </label>
            </div>

            {/* Cloudflare Verification Container */}
            <div className="bg-black/30 border border-white/5 rounded-xl p-2 flex justify-center items-center my-2">
              <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
            </div>

            <button 
              disabled={loading || !agree || !turnstileToken} 
              type="submit" 
              className="btn-magnetic-primary w-full h-11 text-xs tracking-wider uppercase font-black flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  <span>Create Shield Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest">
              <span className="bg-[#0b0f19] px-3 text-slate-400 font-bold">Or register with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button"
              onClick={() => socialLogin(new GoogleAuthProvider())} 
              className="btn-magnetic-glass h-10 w-full text-xs font-semibold flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-amber-400/40"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Google</span>
            </button>
            <button 
              type="button"
              onClick={() => socialLogin(new GithubAuthProvider())} 
              className="btn-magnetic-glass h-10 w-full text-xs font-semibold flex items-center justify-center gap-2 rounded-xl border border-white/10 hover:border-amber-400/40"
            >
              <Github size={15} className="text-white" />
              <span>GitHub</span>
            </button>
          </div>

          <p className="text-center mt-6 text-xs text-slate-400 font-medium">
            Already have an account? <Link to="/login" className="text-amber-400 font-bold hover:underline ml-1">Sign in</Link>
          </p>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="glass-card-premium max-w-md w-full p-8 rounded-3xl text-center space-y-6 animate-scale-up border border-amber-400/30">
              <div className="w-16 h-16 bg-amber-400/15 text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-black text-white">Claim 500 Bonus Credits!</h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Join our official Discord community to link your developer profile and receive 500 free license credits instantly in your Not Exe account.
              </p>
              <div className="space-y-3">
                <a
                  href="https://discord.gg/HrVXH3wNpj"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => navigate('/dashboard')}
                  className="btn-magnetic-primary w-full py-3.5 text-xs uppercase font-black flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Join Discord & Claim
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-xs text-slate-400 hover:text-white py-2 font-semibold transition-colors"
                >
                  Proceed to Console
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
