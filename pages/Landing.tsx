import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Zap, Code, Cloud, BarChart3,
  ChevronRight, Menu, X, Github, ArrowRight,
  ShieldCheck, Activity, Cpu, Globe, Users,
  Terminal, Layers, MessageSquare, ExternalLink,
  ChevronDown, Monitor, CheckCircle2, Key, Database,
  Sparkles, Check, Copy, Server, FileText, Fingerprint,
  Radio, RefreshCw
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';
import { subscribeToSDKs } from '../services/sdkService';
import { SDK } from '../types';
import BrandMark from '../components/BrandMark';

const TECH_STACK = [
  {
    name: 'C++',
    badge: 'C++ Native SDK',
    sub: 'Anti-Tamper & In-Memory',
    glow: 'rgba(245, 158, 11, 0.4)',
    color: '#F59E0B',
    codeSnippet: `#include "NotExeAuth.hpp"

// Initialize Not Exe Client
NotExe::Client client("AppName", "NXE-APP-SECRET-KEY");

if (client.Authenticate("license_key", NotExe::GetHWID())) {
    std::cout << "Access Granted. Verified RSA Signature.\\n";
    std::string secret = client.GetCloudVar("GAME_OFFSET");
}`
  },
  {
    name: 'C#',
    badge: 'C# .NET Core',
    sub: 'WPF, WinForms, Unity',
    glow: 'rgba(155, 79, 150, 0.4)',
    color: '#9B4F96',
    codeSnippet: `using NotExe.Shield;

var auth = new NotExeClient("AppName", "NXE-APP-SECRET-KEY");
var result = await auth.ValidateLicenseAsync("NXE-XXXX-YYYY-ZZZZ");

if (result.IsValid) {
    Console.WriteLine($"Welcome {result.User.Email}! Node verified.");
}`
  },
  {
    name: 'Python',
    badge: 'Python SDK',
    sub: 'FastAPI, Desktop, CLI',
    glow: 'rgba(55, 118, 171, 0.4)',
    color: '#3776AB',
    codeSnippet: `import notexe

client = notexe.Client(app="AppName", secret="NXE-APP-SECRET-KEY")
res = client.login(key="NXE-XXXX-YYYY-ZZZZ")

if res.authorized:
    print(f"HWID Locked: {res.device_id} | Expiry: {res.expiry}")`
  },
  {
    name: 'Rust',
    badge: 'Rust Crates',
    sub: 'Zero Overhead & Memory Safe',
    glow: 'rgba(239, 68, 68, 0.4)',
    color: '#EF4444',
    codeSnippet: `use notexe_auth::NotExeClient;

let client = NotExeClient::new("AppName", "NXE-APP-SECRET-KEY");
let session = client.verify_hwid()?;
println!("Session token verified with RSA-4096: {:?}", session.token);`
  }
];

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState<'ui' | 'code'>('ui');
  const [copiedCode, setCopiedCode] = useState(false);

  const [dynamicSdks, setDynamicSdks] = useState<SDK[]>([]);
  const [selectedSdkId, setSelectedSdkId] = useState<string>('');

  useEffect(() => {
    // Throttled scroll listener to prevent unnecessary re-renders
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

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
      unsubscribe();
    };
  }, []);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-white selection:bg-amber-500/30 font-sans overflow-x-hidden relative">
      {/* High-performance static ambient glows (zero GPU blur overhead) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-glow-top" />
        <div className="ambient-glow-bottom" />
        <div className="grid-cyber-bg" />
      </div>

      {/* Floating Glass Navigation Bar */}
      <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav
          className={`w-full max-w-5xl transition-all duration-300 rounded-full border ${
            isScrolled
              ? 'bg-[#0c1017]/90 backdrop-blur-md border-amber-400/25 py-2.5 px-6 shadow-2xl shadow-black/90'
              : 'bg-[#0c1017]/60 backdrop-blur-md border-white/10 py-3.5 px-7'
          }`}
        >
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <BrandMark size="sm" />
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <Link to="/shop" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Shop
              </Link>
              <Link to="/docs" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Documentation
              </Link>
              <Link to="/tos" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Terms
              </Link>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <Link to="/login" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-magnetic-primary px-5 py-2 text-xs font-black uppercase tracking-wider"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 mt-3 glass-card-premium border border-amber-400/20 p-6 flex flex-col gap-4 rounded-3xl shadow-2xl animate-fade-in">
              <Link to="/shop" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <Link to="/docs" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Documentation
              </Link>
              <Link to="/tos" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Terms of Service
              </Link>
              <hr className="border-white/10 my-1" />
              <Link to="/login" className="text-xs font-semibold text-white" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
              <Link
                to="/signup"
                className="btn-magnetic-primary text-center py-3 text-xs font-black uppercase tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                Create Account
              </Link>
            </div>
          )}
        </nav>
      </div>

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center pt-32 pb-16 px-6 relative">
          {/* Floating High-Tech Badges */}
          <div className="absolute top-40 left-[8%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0c1017]/80 border border-amber-400/25 backdrop-blur-md text-[11px] font-semibold text-slate-200 shadow-xl effect-magnetic">
            <ShieldCheck size={14} className="text-amber-400" />
            <span>HWID Locked & Protected</span>
          </div>
          <div className="absolute top-48 right-[10%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0c1017]/80 border border-cyan-400/25 backdrop-blur-md text-[11px] font-semibold text-slate-200 shadow-xl effect-magnetic">
            <Zap size={14} className="text-cyan-400" />
            <span>&lt;8ms Global Edge Response</span>
          </div>
          <div className="absolute bottom-40 left-[10%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0c1017]/80 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-slate-200 shadow-xl effect-magnetic">
            <Database size={14} className="text-amber-300" />
            <span>Encrypted Cloud Variables</span>
          </div>
          <div className="absolute bottom-36 right-[8%] hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#0c1017]/80 border border-emerald-400/25 backdrop-blur-md text-[11px] font-semibold text-slate-200 shadow-xl effect-magnetic">
            <Lock size={14} className="text-emerald-400" />
            <span>RSA-4096 Anti-Tamper Signing</span>
          </div>

          <div className="max-w-5xl mx-auto text-center animate-slide-up">
            {/* Prominent Glowing Circular Not Exe Mascot Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 opacity-60 blur-xl group-hover:opacity-90 transition-opacity" />
                <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-cyan-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border-2 border-amber-300/40 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Not Exe"
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-amber-400/10 border border-amber-400/30 text-xs font-semibold text-amber-300 mb-6 backdrop-blur-md shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>NOT EXE AUTH SHIELD v2.5 IS LIVE</span>
              <ChevronRight size={14} className="text-amber-400" />
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.08] text-white">
              Next-Gen Cryptographic <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-300 to-amber-500">
                Licensing & HWID Shield.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Military-grade RSA response verification, instantaneous cloud variables, and hardware-fingerprinted licensing built for modern developers and software studios.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/signup"
                className="btn-magnetic-primary h-12 px-8 text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-glow-md"
              >
                <span>Deploy Free License Key</span>
                <ArrowRight size={15} />
              </Link>
              <Link
                to="/docs"
                className="btn-magnetic-glass h-12 px-8 text-xs font-semibold tracking-wider uppercase flex items-center gap-2"
              >
                <span>Explore SDKs</span>
                <ExternalLink size={14} />
              </Link>
            </div>
          </div>

          {/* Interactive Live Preview Component */}
          <div className="max-w-4xl mx-auto w-full animate-fade-in">
            <div className="glass-card-premium rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono text-slate-400">notexe-shield-console.preview</span>
                </div>
                <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
                  <button
                    onClick={() => setPreviewTab('ui')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      previewTab === 'ui' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Console UI
                  </button>
                  <button
                    onClick={() => setPreviewTab('code')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                      previewTab === 'code' ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SDK Integration
                  </button>
                </div>
              </div>

              {previewTab === 'ui' ? (
                <div className="p-6 md:p-8 space-y-6 bg-gradient-to-b from-[#0c1017] to-[#07090e]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Managed Nodes</div>
                      <div className="text-2xl font-black text-white">{totalUsers > 0 ? totalUsers.toLocaleString() : '12,450+'}</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Protection Engine</div>
                      <div className="text-2xl font-black text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                      </div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">HWID Binding</div>
                      <div className="text-2xl font-black text-amber-400">Strict Lock</div>
                    </div>
                    <div className="bg-white/[0.03] border border-white/[0.08] p-4 rounded-2xl">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Signature Mode</div>
                      <div className="text-2xl font-black text-cyan-400">RSA-4096</div>
                    </div>
                  </div>

                  <div className="bg-black/60 border border-white/10 rounded-2xl p-5 space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-white/10 pb-2 text-slate-400 text-[11px] font-bold">
                      <span>LICENSE KEY</span>
                      <span>HWID SIGNATURE</span>
                      <span>STATUS</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="text-amber-300 font-bold">NXE-8821-X99B-3104</span>
                      <span className="text-emerald-400">HARDWARE LOCKED [HWID-99A1-F428]</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Verified</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-200">
                      <span className="text-amber-300 font-bold">NXE-4420-K11C-8921</span>
                      <span className="text-emerald-400">HARDWARE LOCKED [HWID-44C2-B910]</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">Verified</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-[#080b12] font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      {TECH_STACK.map((tech, idx) => (
                        <button
                          key={tech.name}
                          onClick={() => setActiveCodeIndex(idx)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            activeCodeIndex === idx
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                              : 'text-slate-400 hover:text-white bg-white/[0.03] border border-white/5'
                          }`}
                        >
                          {tech.name}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => copyCode(TECH_STACK[activeCodeIndex].codeSnippet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors border border-white/10 cursor-pointer"
                    >
                      {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <pre className="overflow-x-auto p-5 bg-black/80 rounded-2xl border border-white/10 text-slate-200 leading-relaxed custom-scrollbar max-h-80 text-xs">
                    <code>{TECH_STACK[activeCodeIndex].codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* METRICS & CAPABILITIES */}
        <section className="py-20 px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Active Licenses', val: totalUsers > 0 ? totalUsers.toLocaleString() : '10,000+', icon: <Users size={16} />, color: 'text-white' },
              { label: 'Uptime SLA', val: '99.99%', icon: <Activity size={16} />, color: 'text-emerald-400' },
              { label: 'Global Latency', val: '< 8ms', icon: <Zap size={16} />, color: 'text-amber-400' },
              { label: 'Anti-Tamper', val: 'RSA-4096', icon: <ShieldCheck size={16} />, color: 'text-cyan-400' },
            ].map((stat, i) => (
              <div key={i} className="glass-card-premium p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
                  {stat.icon} <span>{stat.label}</span>
                </div>
                <div className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.val}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CORE FEATURES GRID */}
        <section id="features" className="py-20 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-4">
              Defensive Capabilities
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
              Everything Needed To Protect <br />
              <span className="text-slate-400 font-semibold">Against Cracks & Unauthorized Execution.</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
              A comprehensive cryptographic licensing suite engineered specifically for desktop apps, tools, and games.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: <Fingerprint className="w-5 h-5 text-amber-400" />,
                title: 'Hardware Fingerprint Locking',
                desc: 'Binds licenses directly to CPU, motherboard, and BIOS identifiers. Prevents key leaking, multi-PC sharing, and VM cloning.'
              },
              {
                icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
                title: 'RSA-4096 Response Signing',
                desc: 'Every server response is cryptographically signed with our edge private key. HTTP packet interception or hosts-file reroutes fail.'
              },
              {
                icon: <Database className="w-5 h-5 text-cyan-400" />,
                title: 'Encrypted Cloud Variables',
                desc: 'Store sensitive decryption keys, pointers, and game offsets in the cloud. Variables are only delivered upon valid authentication.'
              },
              {
                icon: <MessageSquare className="w-5 h-5 text-amber-300" />,
                title: 'Discord Automated Webhooks',
                desc: 'Receive real-time Discord notifications for logins, redemptions, HWID reset requests, and suspicious tamper attempts.'
              },
              {
                icon: <Terminal className="w-5 h-5 text-purple-400" />,
                title: 'Zero-Dependency Native SDKs',
                desc: 'Single header C++ client, robust C# .NET library, Python package, and Rust crate ready for immediate drag-and-drop integration.'
              },
              {
                icon: <Key className="w-5 h-5 text-rose-400" />,
                title: 'Bulk License Minter',
                desc: 'Instantly generate thousands of licenses with custom NXE- prefixes, custom duration (Days/Lifetime), and level attributes.'
              },
            ].map((f, i) => (
              <div key={i} className="glass-card-premium p-7 rounded-2xl flex flex-col justify-between border border-white/10 hover:border-amber-400/40 transition-colors">
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

        {/* SECURITY GUARANTEE BANNER */}
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <div className="glass-card-premium p-8 md:p-12 rounded-3xl border border-amber-400/25 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                <ShieldCheck className="text-amber-400" size={28} />
              </div>
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Edge Cryptography</div>
                  <h3 className="text-2xl font-black text-white">How Not Exe Prevents Reverse Engineering</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  <div className="space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-400" /> Platform Defenses
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• Server-side token signing using private RSA keys.</li>
                      <li>• Strict HWID hashing prevents VM cloning and multi-seat sharing.</li>
                      <li>• Rate limiting and IP anti-bruteforce protection at Cloudflare Edge.</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="font-bold text-white flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-400" /> Developer Best Practices
                    </div>
                    <ul className="space-y-1.5 text-slate-300">
                      <li>• Verify the signed response with the public PEM key.</li>
                      <li>• Protect critical routines using encrypted Cloud Variables.</li>
                      <li>• Obfuscate native binaries with standard code protection.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10 space-y-8">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
              Ready To Protect Your Application With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-300 to-amber-500">
                Not Exe Shield?
              </span>
            </h2>
            <p className="text-slate-300 text-sm max-w-lg mx-auto leading-relaxed">
              Integrate in minutes using our official SDKs and manage all licenses directly from the web console.
            </p>
            <div className="pt-2">
              <Link
                to="/signup"
                className="btn-magnetic-primary inline-flex h-12 px-9 text-xs font-black tracking-wider uppercase items-center gap-2 shadow-glow-md"
              >
                <span>Create Free Developer Account</span>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#06070a] py-14 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <BrandMark size="sm" />
              </Link>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Next-generation software licensing, hardware-bound anti-crack security, and edge variable management.
              </p>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Platform</div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <Link to="/shop" className="hover:text-amber-400 transition-colors">Shop</Link>
                <Link to="/docs" className="hover:text-amber-400 transition-colors">Documentation</Link>
                <Link to="/login" className="hover:text-amber-400 transition-colors">Sign In</Link>
                <Link to="/signup" className="hover:text-amber-400 transition-colors">Create Account</Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Community & Legal</div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <Link to="/tos" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
                <a
                  href="https://discord.gg/HrVXH3wNpj"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <span>Official Discord</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
            <div>© {new Date().getFullYear()} NOT EXE SHIELD. ALL RIGHTS RESERVED.</div>
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
