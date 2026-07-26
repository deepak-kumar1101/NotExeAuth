
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { Mail, Lock, Loader2, ArrowLeft, Github, CheckCircle2, AlertCircle } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../services/firebase';
import { encrypt, decrypt } from '../services/encryption';
import Turnstile from '../components/Turnstile';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { discordId } = useParams<{ discordId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const linkDiscord = async (email: string, dId: string) => {
    try {
      const emailKey = email.replace(/\./g, ',');
      const snap = await get(ref(db, `customers/${emailKey}`));
      if (snap.exists()) {
        const current = decrypt(snap.val());
        if (current && typeof current === 'object') {
          await set(ref(db, `customers/${emailKey}`), encrypt({
            ...current,
            discordId: dId
          }));
        }
      }
    } catch (err) {
      console.error("Failed to link Discord:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (discordId && user.email) {
          await linkDiscord(user.email, discordId);
          setShowSuccess(true);
          return;
        }
        navigate('/dashboard');
      }
    });
    return unsubscribe;
  }, [navigate, discordId]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    setLoading(true);
    setError('');

    if (!turnstileToken) {
      setError("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (discordId && res.user.email) {
        await linkDiscord(res.user.email, discordId);
        setShowSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Login error details:", err);
      let msg = err.message || "Failed to login.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        msg = "Invalid email or password.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Access temporarily blocked due to multiple failed login attempts. Please wait 15 minutes or use Google / GitHub login below.";
      }
      setError(msg);
    }
    setLoading(false);
  };

  const socialLogin = async (provider: any) => {
    if (!turnstileToken) {
      setError("Please complete the security check first.");
      return;
    }

    try {
      const res = await signInWithPopup(auth, provider);

      if (res.user && res.user.email) {
        const emailKey = res.user.email.replace(/\./g, ',');
        const snap = await get(ref(db, `customers/${emailKey}`));

        if (!snap.exists()) {
          const secret = 'DXA-' + Math.random().toString(36).substring(2, 15).toUpperCase();
          const customer = {
            email: res.user.email,
            secret,
            plan: 'Free Plan',
            credits: 0,
            discordId: discordId || '',
            createdAt: new Date().toISOString()
          };
          await set(ref(db, `customers/${emailKey}`), encrypt(customer));
        } else if (discordId && res.user.email) {
          await linkDiscord(res.user.email, discordId);
        }
      }

      if (discordId) {
        setShowSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError("Social sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-x-hidden overflow-y-auto bg-[#06070a] text-white selection:bg-indigo-500/30 font-sans">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] animate-pulse-glow" />
        <div className="grid-bg opacity-30" />
      </div>

      <div className="w-full max-w-md px-4 py-12 relative z-20 animate-fade-in my-auto">
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors group effect-magnetic">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={15} /> Back to Home
        </Link>

        <div className="glass-card-premium p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-3xl glass-reflection">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-white via-indigo-100 to-indigo-300 text-black mb-4 shadow-lg shadow-white/20 effect-repulsive cursor-pointer">
              <span className="font-black text-sm tracking-tighter">DXA</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">Welcome Back</h1>
            <p className="text-slate-400 text-xs font-medium">Sign in to manage your applications and licensing</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2.5 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
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

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors effect-magnetic">Forgot?</Link>
              </div>
              <div className="relative group">
                <input 
                  name="password" 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  className="w-full bg-[#080a10] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pl-11 shadow-inner" 
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={17} />
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-2.5 flex justify-center items-center shadow-inner my-2">
              <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
            </div>

            <button 
              disabled={loading || !turnstileToken} 
              type="submit" 
              className="btn-magnetic-primary effect-magnetic h-12 w-full text-xs tracking-wider uppercase font-extrabold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#0b0e17] px-3 text-slate-400 font-extrabold">Or continue with</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={() => socialLogin(new GoogleAuthProvider())} 
              className="btn-magnetic-glass effect-repulsive h-11 w-full text-xs font-bold flex items-center justify-center gap-3 rounded-xl border border-white/10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Continue with Google</span>
            </button>
            <button 
              type="button"
              onClick={() => socialLogin(new GithubAuthProvider())} 
              className="btn-magnetic-glass effect-repulsive h-11 w-full text-xs font-bold flex items-center justify-center gap-3 rounded-xl border border-white/10"
            >
              <Github size={17} className="text-white" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="text-center mt-7 text-xs text-slate-400 font-medium">
            Don't have an account? <Link to="/signup" className="text-white font-bold hover:underline effect-magnetic inline-block">Create one</Link>
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass rounded-2xl p-8 text-center animate-slide-up relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-success" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Linking Successful!</h2>
            <p className="text-muted mb-8 leading-relaxed">Your Discord account has been successfully linked to your DXA profile.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              Enter Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
