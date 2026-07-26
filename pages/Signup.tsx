import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { Mail, Lock, Loader2, ArrowLeft, Github, CheckCircle2, AlertCircle, Check, MessageSquare } from 'lucide-react';
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

    if (password !== confirm) return setError('Passwords do not match');
    if (!agree) return setError('You must agree to the Terms of Service');

    setLoading(true);
    setError('');

    if (!turnstileToken) {
      setError("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      if (res.user) {
        const secret = 'DXA-' + Math.random().toString(36).substring(2, 15).toUpperCase();
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
      if (err.code === "auth/email-already-in-use") msg = "Email already in use.";
      if (err.code === "auth/weak-password") msg = "Password must be at least 6 characters.";
      if (err.code === "auth/invalid-email") msg = "Invalid email address.";
      if (err.code === "auth/operation-not-allowed") msg = "Email/Password sign-in is disabled in Firebase Console.";
      if (err.message && err.message.includes("PERMISSION_DENIED")) msg = "Database Permission Denied. Please deploy firebase-rules.json in Firebase Console.";
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
        <Link to="/" className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors group">
          <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" size={15} /> Back to Home
        </Link>

        <div className="glass-card-premium p-8 md:p-10 rounded-3xl border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-3xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent" />

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-white via-indigo-100 to-indigo-300 text-black mb-4 shadow-lg shadow-white/20">
              <span className="font-black text-sm tracking-tighter">DXA</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">Create Account</h1>
            <p className="text-slate-400 text-xs font-medium">Start building secure application licensing</p>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold p-3.5 rounded-xl mb-6 flex items-center gap-2.5 animate-fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block ml-1">Password</label>
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 block ml-1">Confirm</label>
                <div className="relative group">
                  <input 
                    name="confirm" 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    className="w-full bg-[#080a10] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all pl-11 shadow-inner" 
                  />
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={17} />
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <label className="flex items-start gap-3 cursor-pointer group select-none">
                <div onClick={() => setAgree(!agree)} className={`w-4 h-4 rounded-md border transition-all flex items-center justify-center mt-0.5 ${agree ? 'bg-white border-white' : 'border-white/20 bg-[#080a10]'}`}>
                  {agree && <Check size={12} className="text-black stroke-[3px]" />}
                </div>
                <span className="text-xs text-slate-400 leading-relaxed font-medium">
                  I agree to the <Link to="/tos" className="text-white hover:underline font-bold">Terms of Service</Link> and Privacy Policy.
                </span>
              </label>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-2.5 flex justify-center items-center shadow-inner my-2">
              <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />
            </div>

            <button 
              disabled={loading || !agree || !turnstileToken} 
              type="submit" 
              className="btn-magnetic-primary h-12 w-full text-xs tracking-wider uppercase font-extrabold flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
            </button>
          </form>

          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-[#0b0e17] px-3 text-slate-400 font-extrabold">Or sign up with</span></div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              type="button"
              onClick={() => socialLogin(new GoogleAuthProvider())} 
              className="btn-magnetic-glass h-11 w-full text-xs font-bold flex items-center justify-center gap-3 rounded-xl border border-white/10"
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
              className="btn-magnetic-glass h-11 w-full text-xs font-bold flex items-center justify-center gap-3 rounded-xl border border-white/10"
            >
              <Github size={17} className="text-white" />
              <span>Continue with GitHub</span>
            </button>
          </div>

          <p className="text-center mt-7 text-xs text-slate-400 font-medium">
            Already have an account? <Link to="/login" className="text-white font-bold hover:underline">Log in</Link>
          </p>
        </div>

        {showSuccess && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="glass-card-premium max-w-md w-full p-8 rounded-3xl text-center space-y-6 animate-fade-in border border-white/10 shadow-2xl">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-white">Claim 500 Bonus Credits!</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Join our official Discord community to automatically verify your Discord ID and receive 500 free credits directly in your DXA account.
              </p>
              <div className="space-y-3">
                <a
                  href="https://discord.gg/HrVXH3wNpj"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => navigate('/dashboard')}
                  className="w-full btn-magnetic-primary py-3.5 text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2"
                >
                  <MessageSquare size={16} /> Join Discord & Claim
                </a>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="w-full text-xs text-slate-400 hover:text-white py-2 font-semibold transition-colors"
                >
                  Skip for now
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
