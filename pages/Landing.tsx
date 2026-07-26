import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Zap, Code, Cloud, BarChart3,
  ChevronRight, Menu, X, Github, ArrowRight,
  ShieldCheck, Activity, Cpu, Globe, Users,
  Terminal, Layers, MessageSquare, ExternalLink,
  ChevronDown, Monitor, CheckCircle2, Key, Database,
  Sparkles, Check, Copy, Server, FileText
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';
import { subscribeToSDKs } from '../services/sdkService';
import { SDK } from '../types';

const TECH_STACK = [
  {
    name: 'C++',
    badge: 'C++ SDK',
    sub: 'Production Ready',
    glow: 'rgba(0, 89, 156, 0.4)',
    color: '#00599C',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#00599C" d="M117.5 50.4L66.7 21.1c-1.7-1-3.8-1-5.5 0L10.5 50.4c-1.7 1-2.8 2.8-2.8 4.8v58.6c0 2 1.1 3.8 2.8 4.8l50.8 29.3c1.7 1 3.8 1 5.5 0l50.8-29.3c1.7-1 2.8-2.8 2.8-4.8V55.2c0-2-1.1-3.8-2.8-4.8z"/>
        <path fill="#FFF" d="M63.9 44.7c-17.5 0-31.7 14.2-31.7 31.7s14.2 31.7 31.7 31.7c13.7 0 25.5-8.7 29.8-21h-13.8c-3.4 5.3-9.3 8.8-16 8.8-10.7 0-19.3-8.6-19.3-19.3 0-10.7 8.6-19.3 19.3-19.3 6.7 0 12.6 3.5 16 8.8h13.8c-4.3-12.2-16.1-20.9-29.8-20.9zm24.1 27.2v7h-7v4.6h7v7h4.6v-7h7v-4.6h-7v-7h-4.6zm16 0v7h-7v4.6h7v7h4.6v-7h7v-4.6h-7v-7h-4.6z"/>
      </svg>
    )
  },
  {
    name: 'C#',
    badge: 'C# .NET SDK',
    sub: 'Official Support',
    glow: 'rgba(155, 79, 150, 0.4)',
    color: '#9B4F96',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#9B4F96" d="M117.5 50.4L66.7 21.1c-1.7-1-3.8-1-5.5 0L10.5 50.4c-1.7 1-2.8 2.8-2.8 4.8v58.6c0 2 1.1 3.8 2.8 4.8l50.8 29.3c1.7 1 3.8 1 5.5 0l50.8-29.3c1.7-1 2.8-2.8 2.8-4.8V55.2c0-2-1.1-3.8-2.8-4.8z"/>
        <path fill="#FFF" d="M63.9 44.7c-17.5 0-31.7 14.2-31.7 31.7s14.2 31.7 31.7 31.7c13.7 0 25.5-8.7 29.8-21h-13.8c-3.4 5.3-9.3 8.8-16 8.8-10.7 0-19.3-8.6-19.3-19.3 0-10.7 8.6-19.3 19.3-19.3 6.7 0 12.6 3.5 16 8.8h13.8c-4.3-12.2-16.1-20.9-29.8-20.9zm27.1 23.5h-3.6v-6.7h-4.2v6.7h-6.2v-6.7h-4.2v6.7h-3.6v4.2h3.6v6.2h-3.6v4.2h3.6v6.7h4.2v-6.7h6.2v6.7h4.2v-6.7h3.6v-4.2h-3.6v-6.2h3.6v-4.2zm-7.8 10.4h-6.2v-6.2h6.2v6.2z"/>
      </svg>
    )
  },
  {
    name: '.NET',
    badge: '.NET Core SDK',
    sub: 'Cross-Platform',
    glow: 'rgba(81, 43, 212, 0.4)',
    color: '#512BD4',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#512BD4" d="M64 0C28.7 0 0 28.7 0 64s28.7 64 64 64 64-28.7 64-64S99.3 0 64 0zm-27 82.5c-2.4 0-4.4-.9-6-2.6-1.6-1.7-2.4-3.9-2.4-6.6 0-2.7.8-4.9 2.4-6.6 1.6-1.7 3.6-2.6 6-2.6 2.4 0 4.4.9 6 2.6 1.6 1.7 2.4 3.9 2.4 6.6 0 2.7-.8 4.9-2.4 6.6-1.6 1.7-3.6 2.6-6 2.6zm37.2.5h-8.2V44.8h8.2v38.2zm29.8 0h-8.2V58.7c0-2.3-.5-4.1-1.6-5.4-1.1-1.3-2.6-1.9-4.5-1.9-2.2 0-4 .8-5.3 2.3-1.3 1.5-2 3.5-2 6.1v23.2h-8.2V44.8h8.2v5.7c1.3-2.1 3-3.7 5.1-4.7 2.1-1 4.5-1.5 7.1-1.5 4.3 0 7.8 1.3 10.3 3.9 2.5 2.6 3.7 6.2 3.7 10.8V83z"/>
      </svg>
    )
  },
  {
    name: 'Python',
    badge: 'Python SDK',
    sub: 'Production Ready',
    glow: 'rgba(55, 118, 171, 0.4)',
    color: '#3776AB',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#3776AB" d="M63.6 2c-31.5 0-29.6 13.7-29.6 13.7l.1 14.2h30.2v4.3H21.7S2 31.3 2 63.3c0 31.9 17.2 30.8 17.2 30.8h10.3V80c0-14.7 12.6-14.2 12.6-14.2h29.8s12.1.2 12.1-12.1V15.7S105.9 2 63.6 2zm-12.2 9.5c2.7 0 4.9 2.2 4.9 4.9s-2.2 4.9-4.9 4.9-4.9-2.2-4.9-4.9 2.2-4.9 4.9-4.9z"/>
        <path fill="#FFD43B" d="M64.4 126c31.5 0 29.6-13.7 29.6-13.7l-.1-14.2H63.7v-4.3h42.6s19.7 2.9 19.7-29.1c0-31.9-17.2-30.8-17.2-30.8H98.5V48c0 14.7-12.6 14.2-12.6 14.2H56.1s-12.1-.2-12.1 12.1v38.1s-1.9 13.7 40.4 13.7zm12.2-9.5c-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9 4.9 2.2 4.9 4.9-2.2 4.9-4.9 4.9z"/>
      </svg>
    )
  },
  {
    name: 'Java',
    badge: 'Java Client',
    sub: 'Enterprise Grade',
    glow: 'rgba(231, 111, 0, 0.4)',
    color: '#E76F00',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#5382A1" d="M48.8 89.2c0 0-5.8 1.1-12.4 1.4-8 0-14.7-2.3-14.7-5.7 0-5.2 11.2-6.5 17.8-6.5 7.6 0 18.2.9 24.3 4.1-5.1 2.3-15 6.7-15 6.7zM43.9 67.2c0 0-4.7.7-10.4 1.1-6.6 0-12-1.8-12-4.5 0-4.1 9.2-5.1 14.6-5.1 6.2 0 14.9.7 19.9 3.2-4.2 1.8-12.1 5.3-12.1 5.3z"/>
        <path fill="#E76F00" d="M68.5 40.1c4.5 5.2-1.3 12.4-7.4 17.5 9.7-2.8 18.8-7.9 14.6-14.8-3.4-5.6-11.4-8.8-17.2-12.8-5.3-3.6-7.8-8-7.8-8s1.6 4.3 4.5 7c4.6 4.4 8.7 6 13.3 11.1zM84.7 87c1.3.8 2.1 1.7 2.1 2.8 0 3.3-8.8 6.1-23.7 6.1-18.7 0-33.1-4.2-33.1-9.6 0-3.7 6.9-6.9 17.3-8.4l2.5 1.7c-8 1-13.6 3.1-13.6 5.4 0 3.2 11.6 5.8 26 5.8 13.7 0 24.8-2.4 24.8-5.5 0-1.4-2.4-2.8-6.8-3.8l2.3-1.6c4.6 1.3 7.2 2.7 7.2 4.1z"/>
      </svg>
    )
  },
  {
    name: 'TypeScript',
    badge: 'TypeScript SDK',
    sub: 'Type Safe',
    glow: 'rgba(49, 120, 198, 0.4)',
    color: '#3178C6',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#3178C6" d="M0 0h128v128H0z"/>
        <path fill="#FFF" d="M70.1 79.5c1.8 2.8 4.3 5.1 7.6 6.8 3.3 1.7 7 2.6 11.2 2.6 3.5 0 6.6-.6 9.2-1.9 2.6-1.3 4.6-3.1 5.9-5.4 1.4-2.3 2.1-4.9 2.1-7.8 0-3.3-.9-6-2.7-8.1-1.8-2.1-4.2-3.8-7.3-5.1-3.1-1.3-6.9-2.5-11.4-3.6-4.5-1.1-8.5-2.5-12.1-4.2-3.6-1.7-6.5-3.9-8.7-6.6-2.2-2.7-3.3-6.1-3.3-10.2 0-4.3 1.2-8.1 3.6-11.4 2.4-3.3 5.8-5.9 10.1-7.8 4.3-1.9 9.3-2.9 15-2.9 5.8 0 11.1 1.2 15.9 3.5 4.8 2.3 8.6 5.8 11.3 10.3l-12.7 8.3c-1.8-2.6-3.9-4.5-6.4-5.6-2.5-1.1-5.3-1.7-8.4-1.7-3.1 0-5.7.5-7.8 1.6-2.1 1.1-3.7 2.5-4.8 4.3-1.1 1.8-1.7 3.8-1.7 6.1 0 2.8.8 5 2.4 6.7 1.6 1.7 3.8 3.1 6.6 4.2 2.8 1.1 6.3 2.2 10.5 3.3 4.8 1.2 9.1 2.7 12.9 4.5 3.8 1.8 6.9 4.1 9.3 7 2.4 2.9 3.6 6.6 3.6 11.2 0 4.7-1.3 8.9-3.9 12.6-2.6 3.7-6.3 6.6-11.1 8.7-4.8 2.1-10.4 3.1-16.8 3.1-7 0-13.3-1.4-19-4.2-5.7-2.8-10.1-7-13.3-12.6l13.5-7.9zM20.2 38.6h47.9v14.1H44.1v62.4H24.3V52.7H20.2V38.6z"/>
      </svg>
    )
  },
  {
    name: 'Go',
    badge: 'Go Client',
    sub: 'High Throughput',
    glow: 'rgba(0, 173, 216, 0.4)',
    color: '#00ADD8',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#00ADD8" d="M12.9 52.8c-2.3 0-4.3-.8-5.8-2.3C5.6 49 4.8 47 4.8 44.7c0-2.3.8-4.3 2.3-5.8 1.5-1.5 3.5-2.3 5.8-2.3 2.3 0 4.3.8 5.8 2.3 1.5 1.5 2.3 3.5 2.3 5.8 0 2.3-.8 4.3-2.3 5.8-1.5 1.5-3.5 2.3-5.8 2.3zm102.2 0c-2.3 0-4.3-.8-5.8-2.3-1.5-1.5-2.3-3.5-2.3-5.8 0-2.3.8-4.3 2.3-5.8 1.5-1.5 3.5-2.3 5.8-2.3 2.3 0 4.3.8 5.8 2.3 1.5 1.5 2.3 3.5 2.3 5.8 0 2.3-.8 4.3-2.3 5.8-1.5 1.5-3.5 2.3-5.8 2.3zM64 25.6C42.8 25.6 25.6 42.8 25.6 64S42.8 102.4 64 102.4c16.3 0 30.4-10.2 36-24.6H64V61.4h52.8c.8 4.1 1.2 8.3 1.2 12.6 0 29.2-23.6 52.8-54 52.8C28.7 126.8 0 98.1 0 64S28.7 1.2 64 1.2c24.3 0 45.4 16.3 52.3 39.4h-17C92.9 31.4 79.5 25.6 64 25.6z"/>
      </svg>
    )
  },
  {
    name: 'Rust',
    badge: 'Rust Client',
    sub: 'Zero Overhead',
    glow: 'rgba(222, 165, 132, 0.4)',
    color: '#DEA584',
    svg: (
      <svg viewBox="0 0 128 128" className="w-10 h-10 shrink-0">
        <path fill="#DEA584" d="M127.2 59.8l-7.3-3.6 2.3-7.7-8.1-.5-.5-8.1-8-2.7-3.4-7.4-7.4-4.8-5.8-5.7-6.2-3.8-7.7-1.3L77 12l-8-.5L64.4 7l-7.8 4.5-8 .5-4.6 6.7-7.7 1.3-6.2 3.8-5.8 5.7-7.4 4.8-3.4 7.4-8 2.7-.5 8.1-8.1.5 2.3 7.7-7.3 3.6 4.8 6.5-6.2 5.1 6.8 4.3-4.8 6.5 8 1.9-3 7.4 8.2 4.4-.8 8.1 7.7 4 1.4 8 6.8 5.7 3.5 7.4 5.6 6 5.4 5.1 6.8 3.5 6.8 2.1 7.6.7 7.7-.8 8-2.3 7.7-3.8 6.9-5.1 5.7-6.2 4.2-7 2.3-7.5.3-7.9-1.8-7.7 3.7-6.9-3.7-7.4 5.2-6.2-5.2-6.9 3.7-7.7-1.8-7.9.3-7.5 2.3-7 4.2-6.2 5.7-5.1 6.9-3.8 8-2.3 7.7-.8 7.6.7 6.8 2.1 6.8 3.5 5.4 5.1 5.6 6 3.5 7.4 6.8 5.7 1.4 8 7.7 4-.8 8.1 8.2 4.4-3 7.4 8 1.9-4.8 6.5 6.8 4.3-6.2 5.1 4.8 6.5zm-63.2 48.7c-24.6 0-44.5-19.9-44.5-44.5S39.4 19.5 64 19.5s44.5 19.9 44.5 44.5-19.9 44.5-44.5 44.5z"/>
        <path fill="#FFF" d="M64 32c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-12 48H44V48h14c6 0 10 3 10 8 0 4-3 7-7 8l8 16h-9l-7-14h-5v14zm5-21h5c3 0 5-1 5-4s-2-4-5-4h-5v8z"/>
      </svg>
    )
  }
];

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeCodeTab, setActiveCodeTab] = useState<'python' | 'csharp'>('python');
  const [previewTab, setPreviewTab] = useState<'ui' | 'code'>('ui');
  const [copiedCode, setCopiedCode] = useState(false);

  const [dynamicSdks, setDynamicSdks] = useState<SDK[]>([]);
  const [selectedSdkId, setSelectedSdkId] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);

    const unsubscribe = subscribeToSDKs((loadedSdks) => {
      const visible = loadedSdks.filter(s => s.visible !== false);
      setDynamicSdks(visible);
      if (visible.length > 0 && !selectedSdkId) {
        setSelectedSdkId(visible[0].id);
      }
    });

    const fetchUserCount = async () => {
      try {
        const statsRef = ref(db, 'system/stats');
        const snapshot = await get(statsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTotalUsers(data.totalUsers || 0);
        }
      } catch (err) {
        console.error('Failed to fetch user count:', err);
      }
    };
    fetchUserCount();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      unsubscribe();
    };
  }, []);

  const pythonSnippet = `import dxa

# Initialize DXA Auth Client
client = dxa.Client(
    app_name="MyApplication",
    secret_key="DXA-MASTER-SECRET-KEY"
)

# Authenticate User with HWID Lock
res = client.login(username="john_doe", password="Password123!")

if res.success:
    print(f"User Authorized! Expiry: {res.user.expiry}")
    print(f"Encrypted Cloud Variable: {client.get_var('LICENSE_KEY')}")
else:
    print(f"Authentication Failed: {res.error}")`;

  const csharpSnippet = `using DXA;

// Initialize DXA Client
var client = new DXAClient("MyApplication", "DXA-MASTER-SECRET-KEY");

// Authenticate User & Validate Hardware Signature
var response = await client.AuthenticateAsync("john_doe", "Password123!");

if (response.Success) {
    Console.WriteLine($"Access Granted! Welcome {response.User.Username}");
    string cloudSecret = await client.GetVariableAsync("API_SECRET");
} else {
    Console.WriteLine($"Error: {response.ErrorMessage}");
}`;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-indigo-500/30 font-sans overflow-x-hidden scroll-smooth relative">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute transition-opacity duration-300 opacity-60"
          style={{
            background: `radial-gradient(700px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 80%)`,
            inset: 0
          }}
        />
        <div className="absolute top-[-10%] left-[15%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] animate-pulse-glow" />
        <div className="grid-bg opacity-30" />
      </div>

      
      <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4">
        <nav className={`w-full max-w-5xl transition-all duration-300 rounded-full border ${isScrolled ? 'bg-[#0d0f17]/85 backdrop-blur-2xl border-white/[0.15] py-2.5 px-6 shadow-2xl shadow-black/90 glass-reflection' : 'bg-white/[0.03] backdrop-blur-xl border-white/[0.1] py-3.5 px-7'}`}>
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-white via-slate-200 to-indigo-200 text-black flex items-center justify-center font-black text-xs transition-transform group-hover:scale-110 shadow-lg shadow-white/20">
                DXA
              </div>
              <span className="font-bold text-xs uppercase tracking-[0.2em] text-white group-hover:text-indigo-300 transition-colors">Deep X Auth</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <Link to="/shop" className="text-[11px] font-semibold tracking-wider text-slate-300 hover:text-white transition-colors effect-magnetic">Shop</Link>
              <Link to="/tos" className="text-[11px] font-semibold tracking-wider text-slate-300 hover:text-white transition-colors effect-magnetic">Terms</Link>
              <Link to="/docs" className="text-[11px] font-semibold tracking-wider text-slate-300 hover:text-white transition-colors effect-magnetic">Documentation</Link>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <Link to="/login" className="text-[11px] font-semibold tracking-wider text-slate-300 hover:text-white transition-colors effect-magnetic">Log In</Link>
              <Link to="/signup" className="btn-magnetic-primary effect-magnetic px-5 py-2 text-xs font-bold uppercase tracking-wider shadow-lg">
                Sign Up
              </Link>
            </div>

            <button className="md:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-3 glass-card border border-white/10 p-6 flex flex-col gap-4 rounded-3xl shadow-2xl animate-fade-in glass-reflection">
              <Link to="/shop" className="text-xs font-semibold text-slate-300 hover:text-white effect-magnetic" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              <Link to="/tos" className="text-xs font-semibold text-slate-300 hover:text-white effect-magnetic" onClick={() => setIsMenuOpen(false)}>Terms of Service</Link>
              <Link to="/docs" className="text-xs font-semibold text-slate-300 hover:text-white effect-magnetic" onClick={() => setIsMenuOpen(false)}>Documentation</Link>
              <hr className="border-white/10 my-1" />
              <Link to="/login" className="text-xs font-semibold text-white effect-magnetic" onClick={() => setIsMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn-magnetic-primary effect-magnetic text-center py-3 text-xs font-bold uppercase tracking-wider" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
            </div>
          )}
        </nav>
      </div>

      <main className="relative z-10">
        
        <section className="min-h-screen flex flex-col justify-center pt-28 pb-16 px-6 relative">
          
          <div className="absolute top-36 left-[8%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/12 backdrop-blur-xl text-[11px] font-semibold text-slate-200 shadow-2xl animate-float-slow glass-reflection effect-repulsive cursor-pointer">
            <ShieldCheck size={14} className="text-emerald-400" /> HWID Locked
          </div>
          <div className="absolute top-48 right-[10%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/12 backdrop-blur-xl text-[11px] font-semibold text-slate-200 shadow-2xl animate-float-delayed glass-reflection effect-repulsive cursor-pointer">
            <Zap size={14} className="text-amber-400" /> &lt;5ms API Latency
          </div>
          <div className="absolute bottom-40 left-[10%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/12 backdrop-blur-xl text-[11px] font-semibold text-slate-200 shadow-2xl animate-float-slow glass-reflection effect-repulsive cursor-pointer">
            <Database size={14} className="text-indigo-400" /> Cloud Variables
          </div>
          <div className="absolute bottom-32 right-[8%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/12 backdrop-blur-xl text-[11px] font-semibold text-slate-200 shadow-2xl animate-float-delayed glass-reflection effect-repulsive cursor-pointer">
            <Lock size={14} className="text-purple-400" /> AES-256 Encrypted
          </div>

          <div className="max-w-6xl mx-auto text-center animate-slide-up">
            
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.05] border border-white/15 text-xs font-semibold text-slate-200 mb-8 backdrop-blur-2xl shadow-xl glass-reflection effect-repulsive cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Authentication Architecture v2.0 Released</span>
              <ChevronRight size={14} className="text-indigo-300" />
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.05] text-white drop-shadow-2xl">
              Enterprise Software <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                Licensing & Security.
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              High-performance, hardware-bound authentication and cloud licensing built for modern developers. Protect your software and scale with zero friction.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/signup" className="btn-magnetic-primary effect-magnetic h-13 px-8 text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-glow-md">
                Start Building Free <ArrowRight size={15} />
              </Link>
              <Link to="/docs" className="btn-magnetic-glass effect-repulsive h-13 px-8 text-xs font-semibold tracking-wider uppercase flex items-center gap-2">
                Explore Documentation <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          
          <div className="max-w-5xl mx-auto w-full animate-fade-in">
            <div className="glass-card-premium rounded-3xl border border-white/12 overflow-hidden shadow-2xl glass-reflection">
              
              <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">dxa-dashboard-v2.preview</span>
                </div>
                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                  <button 
                    onClick={() => setPreviewTab('ui')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${previewTab === 'ui' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    UI Preview
                  </button>
                  <button 
                    onClick={() => setPreviewTab('code')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${previewTab === 'code' ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    SDK Code
                  </button>
                </div>
              </div>

              {previewTab === 'ui' ? (
                <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-[#0b0e17] to-[#07080c]">
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Total Users</div>
                      <div className="text-2xl font-black text-white">{totalUsers > 0 ? totalUsers.toLocaleString() : '10,000+'}</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Active Status</div>
                      <div className="text-2xl font-black text-emerald-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> 100% Online
                      </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">HWID Protection</div>
                      <div className="text-2xl font-black text-indigo-400">Enabled</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Encryption</div>
                      <div className="text-2xl font-black text-purple-400">AES-256</div>
                    </div>
                  </div>

                  
                  <div className="bg-black/50 border border-white/10 rounded-2xl p-5 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 text-slate-400">
                      <span>USER KEY</span>
                      <span>HWID STATUS</span>
                      <span>EXPIRY</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                      <span>DXA-9921-X48A-8812</span>
                      <span className="text-emerald-400 font-semibold">LOCKED (Device ID: 88A4-F291)</span>
                      <span>Lifetime</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                      <span>DXA-4412-K992-1082</span>
                      <span className="text-emerald-400 font-semibold">LOCKED (Device ID: 99B1-C410)</span>
                      <span>30 Days</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#080a10] font-mono text-xs text-slate-300 relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
                      {dynamicSdks.map((sdk) => (
                        <button
                          key={sdk.id}
                          onClick={() => setSelectedSdkId(sdk.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                            selectedSdkId === sdk.id
                              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                              : 'text-slate-400 hover:text-white bg-white/[0.03] border border-white/5'
                          }`}
                        >
                          <span>{sdk.name}</span>
                          {sdk.version && <span className="text-[9px] opacity-70">({sdk.version})</span>}
                        </button>
                      ))}
                    </div>

                    {selectedSdkId && (
                      <div className="flex items-center gap-3 shrink-0">
                        {dynamicSdks.find(s => s.id === selectedSdkId)?.githubUrl && (
                          <a
                            href={dynamicSdks.find(s => s.id === selectedSdkId)?.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 transition-colors"
                          >
                            <Github size={13} />
                            <span>GitHub</span>
                          </a>
                        )}
                        <button
                          onClick={() => {
                            const cur = dynamicSdks.find(s => s.id === selectedSdkId);
                            if (cur) copyCode(cur.sdkCode);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10"
                        >
                          {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedSdkId ? (
                    <div className="space-y-3">
                      {dynamicSdks.find(s => s.id === selectedSdkId)?.description && (
                        <p className="text-slate-400 text-xs font-sans italic bg-white/[0.02] p-3 rounded-xl border border-white/5">
                          {dynamicSdks.find(s => s.id === selectedSdkId)?.description}
                        </p>
                      )}
                      <pre className="overflow-x-auto p-5 bg-black/70 rounded-2xl border border-white/10 text-slate-200 leading-relaxed custom-scrollbar max-h-96 text-xs">
                        <code>{dynamicSdks.find(s => s.id === selectedSdkId)?.sdkCode || '// No source code available.'}</code>
                      </pre>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-slate-500 font-sans text-xs">No SDKs registered in database.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* OFFICIAL SDK & TECHNOLOGY MARQUEE */}
        <section className="py-20 border-y border-white/[0.08] bg-gradient-to-b from-[#090b14]/80 via-[#07080d] to-[#090b14]/80 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-indigo-600/[0.02] pointer-events-none" />
          <div className="max-w-6xl mx-auto px-6 mb-12 text-center relative z-10 space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-bold uppercase tracking-widest text-indigo-300">
              Tech Stack Integration
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white uppercase">
              BUILD WITH YOUR FAVORITE STACK
            </h2>
            <p className="text-slate-400 text-xs font-medium max-w-md mx-auto">
              Official SDKs for desktop, web, and backend applications.
            </p>
          </div>

          <div className="relative w-full overflow-hidden marquee-mask-fade marquee-group py-4">
            <div className="animate-marquee-scroll flex items-center gap-14 md:gap-20">
              {[...TECH_STACK, ...TECH_STACK, ...TECH_STACK].map((tech, idx) => (
                <div 
                  key={`${tech.name}-${idx}`} 
                  className="group/logo relative flex flex-col items-center justify-center cursor-pointer transition-all duration-300"
                >
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover/logo:opacity-100 transition-all duration-200 pointer-events-none transform translate-y-2 group-hover/logo:translate-y-0 z-30">
                    <div className="px-3 py-1.5 rounded-xl bg-[#0e111d] border border-white/15 text-[10px] font-bold tracking-wider text-white shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{tech.badge}</span>
                      <span className="text-slate-400 font-normal">| {tech.sub}</span>
                    </div>
                  </div>

                  {/* Logo SVG */}
                  <div className="opacity-40 grayscale brightness-75 group-hover/logo:opacity-100 group-hover/logo:grayscale-0 group-hover/logo:brightness-125 group-hover/logo:scale-110 group-hover/logo:-translate-y-1.5 transition-all duration-300 p-2">
                    <div style={{ filter: `drop-shadow(0 0 16px ${tech.glow})` }}>
                      {tech.svg}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        
        <section className="py-24 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Cloud Users', val: totalUsers > 0 ? totalUsers.toLocaleString() : '10,000+', icon: <Users size={16} />, color: 'text-white' },
              { label: 'Uptime SLA', val: '99.99%', icon: <Activity size={16} />, color: 'text-emerald-400' },
              { label: 'Auth Latency', val: '< 5ms', icon: <Zap size={16} />, color: 'text-amber-400' },
              { label: 'Encryption', val: 'AES-256', icon: <ShieldCheck size={16} />, color: 'text-purple-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-card-premium p-6 rounded-2xl glass-reflection">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  {stat.icon} <span>{stat.label}</span>
                </div>
                <div className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.val}</div>
              </div>
            ))}
          </div>
        </section>

        
        <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold uppercase tracking-widest text-indigo-300 mb-4">
              Capabilities
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-4">
              Everything You Need <br />
              <span className="text-slate-400 font-semibold">To Protect & Scale.</span>
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto font-medium leading-relaxed">
              A complete, developer-first suite of tools for hardware authentication, cloud variables, and license management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { icon: <Lock className="w-5 h-5 text-indigo-400" />, title: 'HWID Device Lock', desc: 'Secure hardware fingerprint binding prevents account sharing and unauthorized multi-machine execution.' },
              { icon: <Database className="w-5 h-5 text-purple-400" />, title: 'Cloud Variables', desc: 'Manage remote app keys, API secrets, and global feature flags dynamically without client updates.' },
              { icon: <MessageSquare className="w-5 h-5 text-emerald-400" />, title: 'Discord Webhooks', desc: 'Get live instant notifications for account creations, license redemptions, and security breaches.' },
              { icon: <Shield className="w-5 h-5 text-rose-400" />, title: 'Server-Side Validation', desc: 'All critical license checks take place on Cloudflare Workers edge nodes, immune to memory editing.' },
              { icon: <Terminal className="w-5 h-5 text-amber-400" />, title: 'Native Client SDKs', desc: 'Drop-in single-header and zero-dependency libraries for C#, Python, C++, and Rust.' },
              { icon: <Key className="w-5 h-5 text-cyan-400" />, title: 'Bulk Key Engine', desc: 'Generate single or thousands of license keys with customizable prefixes, lengths, and expiry dates.' },
            ].map((f, i) => (
              <div key={i} className="glass-card-premium p-7 rounded-2xl flex flex-col justify-between glass-reflection">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-normal">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        
        <section className="py-20 px-6 max-w-5xl mx-auto">
          <div className="glass-card-premium p-8 md:p-12 rounded-3xl border border-white/12 relative overflow-hidden glass-reflection">
            <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="text-indigo-400" size={28} />
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-1">Architecture Guarantee</div>
                  <h3 className="text-2xl font-extrabold text-white">How Deep X Auth Guarantees Protection</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" /> What DXA Does
                    </div>
                    <ul className="space-y-1.5 text-slate-400">
                      <li>• Cryptographically signs server responses.</li>
                      <li>• Enforces hardware device uniqueness (HWID).</li>
                      <li>• Restricts unauthorized API writes.</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" /> Developer Best Practices
                    </div>
                    <ul className="space-y-1.5 text-slate-400">
                      <li>• Obfuscate native client binaries.</li>
                      <li>• Validate return signatures inside app logic.</li>
                      <li>• Utilize encrypted cloud variables.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
        <section className="py-28 px-6 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
              Ready to Upgrade Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                Software Licensing?
              </span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base font-normal max-w-lg mx-auto leading-relaxed">
              Get started in less than 5 minutes with our zero-dependency SDKs and intuitive dashboard.
            </p>
            <div className="pt-2">
              <Link to="/signup" className="btn-magnetic-primary inline-flex h-14 px-10 text-xs font-bold tracking-wider uppercase items-center gap-3 shadow-glow-md">
                Create Free Account <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      
      <footer className="border-t border-white/[0.08] bg-[#06070a] py-16 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs">
                  DXA
                </div>
                <span className="font-bold text-xs uppercase tracking-widest text-white">Deep X Auth</span>
              </Link>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Next-generation software licensing and hardware-bound authentication for modern developers.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Platform</div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
                <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
                <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
                <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Legal & Community</div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <Link to="/tos" className="hover:text-white transition-colors">Terms of Service</Link>
                <a href="https://discord.gg/HrVXH3wNpj" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                  Discord <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div>© {new Date().getFullYear()} DEEP X AUTHENTICATION. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-6">
              <Link to="/tos" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
              <Link to="/tos" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
