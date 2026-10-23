import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Zap, Code, Cloud, BarChart3,
  ChevronRight, Menu, X, Github, ArrowRight,
  ShieldCheck, Activity, Cpu, Globe, Users,
  Terminal, Layers, MessageSquare, ExternalLink,
  ChevronDown, Monitor, CheckCircle2, Key, Database,
  Sparkles, Check, Copy, Server, FileText, Fingerprint,
  Radio, RefreshCw, HelpCircle, HardDrive, CpuIcon,
  Sliders, ArrowUpRight
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';
import BrandMark from '../components/BrandMark';

// API Command Endpoints structure (Mughal Auth style)
const API_CATEGORIES = [
  {
    id: 'apps',
    name: 'Applications',
    icon: <Database className="w-4 h-4 text-amber-400" />,
    endpoints: [
      {
        method: 'GET',
        path: '/apps',
        desc: 'List all seller-owned applications and active status',
        auth: 'Authorization: Bearer <secret>',
        response: `{ "success": true, "apps": ["MyApp-V1", "LoaderPro"] }`
      },
      {
        method: 'POST',
        path: '/apps',
        desc: 'Create a new protected application with cryptographic keys',
        auth: 'Authorization: Bearer <secret>',
        response: `{ "success": true, "message": "App created", "appId": "NXE-8821" }`
      }
    ]
  },
  {
    id: 'licenses',
    name: 'Licenses',
    icon: <Key className="w-4 h-4 text-emerald-400" />,
    endpoints: [
      {
        method: 'GET',
        path: '/apps/:id/licenses',
        desc: 'Fetch paginated licenses with HWID and expiry status',
        auth: 'Authorization: Bearer <secret>',
        response: `{ "success": true, "count": 250, "licenses": [{ "key": "NXE-99A1-B2C3", "used": true }] }`
      },
      {
        method: 'POST',
        path: '/apps/:id/licenses',
        desc: 'Generate single or bulk license keys with custom prefixes',
        auth: 'Authorization: Bearer <secret>',
        response: `{ "success": true, "generated": 5, "keys": ["NXE-X881-A912", "NXE-B410-C229"] }`
      }
    ]
  },
  {
    id: 'users',
    name: 'Users & HWID',
    icon: <Users className="w-4 h-4 text-cyan-400" />,
    endpoints: [
      {
        method: 'POST',
        path: '/login',
        desc: 'Validate user credentials or license key and lock hardware signature',
        auth: 'Payload: { appName, secret, licenseKey, hwid }',
        response: `{ "success": true, "token": "JWT_TOKEN", "hwidLocked": true, "expiry": "2026-12-31" }`
      },
      {
        method: 'POST',
        path: '/hwid/reset',
        desc: 'Developer or user one-click hardware identifier reset',
        auth: 'Authorization: Bearer <secret>',
        response: `{ "success": true, "message": "HWID_RESET_SUCCESSFUL" }`
      }
    ]
  },
  {
    id: 'variables',
    name: 'Cloud Variables',
    icon: <Lock className="w-4 h-4 text-purple-400" />,
    endpoints: [
      {
        method: 'GET',
        path: '/var/:name',
        desc: 'Retrieve encrypted runtime variable or memory offset',
        auth: 'Payload: { sessionToken, varName }',
        response: `{ "success": true, "value": "0x7FFF54A180", "signature": "RSA_SIGNED_HASH" }`
      }
    ]
  }
];

// Infrastructure Regional Shards (Mughal Auth style)
const REGIONAL_SHARDS = [
  { region: 'US East', location: 'N. Virginia', latency: '12ms', status: 'Operational', flag: '🇺🇸' },
  { region: 'EU Central', location: 'Frankfurt', latency: '18ms', status: 'Operational', flag: '🇩🇪' },
  { region: 'AP South', location: 'Mumbai', latency: '8ms', status: 'Operational', flag: '🇮🇳' },
  { region: 'AP East', location: 'Tokyo', latency: '24ms', status: 'Operational', flag: '🇯🇵' },
];

// FAQs (Mughal Auth style)
const FAQS = [
  {
    q: 'Is Not Exe Auth a separate frontend and backend?',
    a: 'Yes. The React frontend runs separately from the Cloudflare edge serverless API. Frontend assets are distributed via global CDN caching, while the backend strictly enforces authentication, token security, and database verification.'
  },
  {
    q: 'Can users and licenses be managed from one panel?',
    a: 'Yes. The control panel provides centralized management for applications, license keys, user profiles, hardware resets, cloud variables, reseller allocations, and real-time audit event logs.'
  },
  {
    q: 'Can someone bypass the dashboard from frontend code?',
    a: 'No. The client interface is never the security boundary. Every critical operation requires cryptographic validation, RSA-4096 response signing, and strict backend permission checks on Cloudflare Workers.'
  },
  {
    q: 'How does hardware-locked (HWID) security work?',
    a: 'Upon first redemption, the client computes a cryptographic hash of CPU, motherboard, and BIOS signatures. Once locked, authentication fails if executed on an unauthorized secondary device.'
  },
  {
    q: 'What happens if the API is offline?',
    a: 'Not Exe operates on Cloudflare’s distributed 300+ city edge network with 99.99% uptime SLA, redundant regional failover, and automatic DDoS mitigation.'
  }
];

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeApiTab, setActiveApiTab] = useState('apps');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 30);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#06070a] text-white selection:bg-amber-500/30 font-sans overflow-x-hidden relative">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="ambient-glow-top" />
        <div className="ambient-glow-bottom" />
        <div className="grid-cyber-bg" />
      </div>

      {/* TOP FLOATING NAVIGATION BAR (Mughal Auth Liquid Pill Style) */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav
          className={`w-full max-w-6xl transition-all duration-300 rounded-full border ${
            isScrolled
              ? 'bg-[#090b12]/90 backdrop-blur-xl border-amber-400/30 py-2.5 px-6 shadow-2xl shadow-black/90'
              : 'bg-[#0c0f18]/70 backdrop-blur-xl border-white/10 py-3.5 px-7'
          }`}
        >
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <BrandMark size="sm" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7">
              <a href="#features" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Features
              </a>
              <a href="#endpoints" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                API Commands
              </a>
              <a href="#infrastructure" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Status
              </a>
              <Link to="/docs" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Docs
              </Link>
              <Link to="/shop" className="text-xs font-semibold tracking-wider text-slate-300 hover:text-amber-400 transition-colors">
                Shop
              </Link>
            </div>

            {/* Right Status & Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-mono text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>API ONLINE</span>
              </div>

              <Link
                to="/login"
                className="btn-magnetic-primary px-4 py-2 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-glow-sm"
              >
                <span>Open Panel</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Dropdown */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 mt-3 liquid-glass-strong border border-amber-400/25 p-6 flex flex-col gap-4 rounded-3xl shadow-2xl animate-fade-in">
              <a href="#features" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Features
              </a>
              <a href="#endpoints" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                API Commands
              </a>
              <a href="#infrastructure" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Status
              </a>
              <Link to="/docs" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Docs
              </Link>
              <Link to="/shop" className="text-xs font-semibold text-slate-300 hover:text-amber-400" onClick={() => setIsMenuOpen(false)}>
                Shop
              </Link>
              <hr className="border-white/10 my-1" />
              <Link
                to="/login"
                className="btn-magnetic-primary text-center py-3 text-xs font-black uppercase tracking-wider"
                onClick={() => setIsMenuOpen(false)}
              >
                Open Panel Now
              </Link>
            </div>
          )}
        </nav>
      </header>

      <main className="relative z-10">
        {/* HERO SECTION (Mughal Auth Layout) */}
        <section className="min-h-screen flex flex-col justify-center pt-32 pb-16 px-6 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            
            {/* Mascot Avatar Centerpiece */}
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 opacity-60 blur-xl group-hover:opacity-90 transition-opacity" />
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-yellow-300 to-cyan-400 shadow-[0_0_35px_rgba(245,158,11,0.5)]">
                  <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] border border-amber-300/40 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Not Exe"
                      className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Top Status Banner (Identical to Mughal Auth) */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/[0.04] border border-white/10 text-xs font-semibold text-slate-300 mb-6 backdrop-blur-md shadow-lg">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>API Systems Online</span>
              <span className="text-slate-500">•</span>
              <span className="text-amber-300 font-mono">Now securing {totalUsers > 0 ? totalUsers.toLocaleString() : '12,500+'} applications</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.08] text-white">
              Control Your Software With <br />
              <span className="text-gradient-gold">
                Not Exe Auth.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              A secure licensing control panel for applications, users, licenses, tokens, sessions, HWID resets, files, variables, and audit logs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/login"
                className="btn-magnetic-primary h-12 px-8 text-xs font-black tracking-wider uppercase flex items-center gap-2 shadow-glow-sm"
              >
                <span>Open Panel</span>
                <ArrowRight size={14} />
              </Link>
              <a
                href="https://discord.gg/HrVXH3wNpj"
                target="_blank"
                rel="noreferrer"
                className="btn-magnetic-glass h-12 px-8 text-xs font-semibold tracking-wider uppercase flex items-center gap-2"
              >
                <span>Contact Support</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* REAL-TIME SERVICE METRICS (Mughal Auth 6-tile live grid) */}
          <div className="max-w-6xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Active Services', val: 'Operational', color: 'text-emerald-400', badge: '100%' },
              { label: 'Edge Latency', val: '< 8ms', color: 'text-amber-400', badge: 'Fast' },
              { label: 'Uptime SLA', val: '99.99%', color: 'text-white', badge: 'SLA' },
              { label: 'Secured Apps', val: '2,500+', color: 'text-cyan-400', badge: 'Live' },
              { label: 'Active Users', val: totalUsers > 0 ? `${totalUsers.toLocaleString()}` : '50,000+', color: 'text-white', badge: 'Nodes' },
              { label: 'Protected Events', val: '1.4M+', color: 'text-amber-300', badge: 'Audit' },
            ].map((m, idx) => (
              <div key={idx} className="liquid-glass p-4 rounded-2xl flex flex-col justify-between">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase mb-2">
                  <span>{m.label}</span>
                  <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-[9px] font-bold">{m.badge}</span>
                </div>
                <div className={`text-base sm:text-lg font-black tracking-tight ${m.color}`}>
                  {m.val}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CORE CAPABILITIES (Mughal Auth 6 Feature Cards) */}
        <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-[11px] font-bold uppercase tracking-widest text-amber-300 mb-3">
              Capabilities
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-3">
              Everything for License Operations
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium leading-relaxed">
              A fast control panel for managing apps, licenses, users, tokens, sessions, and reseller workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <Key className="w-5 h-5 text-amber-400" />,
                title: 'License Control',
                desc: 'Create, copy, revoke, extend, and audit licenses with app-scoped controls, batch generator, and safe API calls.'
              },
              {
                icon: <Users className="w-5 h-5 text-emerald-400" />,
                title: 'User Operations',
                desc: 'Manage users, HWID resets, bans, subscriptions, sessions, cooldowns, and last-login metadata from one place.'
              },
              {
                icon: <Lock className="w-5 h-5 text-cyan-400" />,
                title: 'Token Security',
                desc: 'Protect reseller, seller, and client API flows with scoped master secrets, session checks, and edge validation.'
              },
              {
                icon: <Activity className="w-5 h-5 text-purple-400" />,
                title: 'Real-time Audit Logs',
                desc: 'Track user, license, session, and administrative actions with clean, filterable event trails for every application.'
              },
              {
                icon: <Database className="w-5 h-5 text-rose-400" />,
                title: 'Files & Variables',
                desc: 'Upload protected files, define runtime memory variables, and expose only the sensitive data authorized clients receive.'
              },
              {
                icon: <Zap className="w-5 h-5 text-amber-300" />,
                title: 'Fast Edge Architecture',
                desc: 'Vite-built frontend caches globally on CDN while Cloudflare Workers handle instant cryptographic verification.'
              },
            ].map((f, i) => (
              <div key={i} className="liquid-glass p-7 rounded-2xl flex flex-col justify-between">
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

        {/* DEVELOPER ENDPOINTS & COMMAND PALETTE (Mughal Auth API Showcase) */}
        <section id="endpoints" className="py-20 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3.5 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-[11px] font-bold uppercase tracking-widest text-cyan-300 mb-3">
              Developer Endpoints
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Ready For Direct API Integration
            </h2>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Clean RESTful endpoints supporting JSON payloads, scoped secrets, and RSA responses.
            </p>
          </div>

          {/* Liquid Glass Tabs & Endpoint Container */}
          <div className="liquid-glass-strong border border-white/10 p-6 md:p-8">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6 overflow-x-auto custom-scrollbar">
              {API_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveApiTab(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeApiTab === cat.id
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
                      : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>

            {/* Endpoints List */}
            <div className="space-y-4">
              {API_CATEGORIES.find(c => c.id === activeApiTab)?.endpoints.map((ep, idx) => (
                <div key={idx} className="liquid-glass p-5 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                        ep.method === 'GET' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                        ep.method === 'POST' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">{ep.path}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{ep.auth}</span>
                  </div>

                  <p className="text-slate-400 text-xs font-normal">{ep.desc}</p>

                  <div className="bg-black/60 rounded-xl p-3 border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto custom-scrollbar">
                    <span className="text-slate-500 select-none mr-2">Response:</span>
                    <code>{ep.response}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* INFRASTRUCTURE REGIONAL SHARDS (Mughal Auth Style) */}
        <section id="infrastructure" className="py-20 px-6 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/30 text-[11px] font-bold uppercase tracking-widest text-emerald-400 mb-3">
              Global Shards
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Multi-Region Edge Infrastructure
            </h2>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Automated load balancing and edge caching across major global continents.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {REGIONAL_SHARDS.map((shard, idx) => (
              <div key={idx} className="liquid-glass p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{shard.flag}</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-mono font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{shard.status}</span>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-white">{shard.region}</div>
                  <div className="text-xs text-slate-400">{shard.location}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Avg Latency</span>
                  <span className="text-amber-400 font-bold">{shard.latency}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION (Mughal Auth FAQ section) */}
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-bold uppercase tracking-widest text-slate-300 mb-3">
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Architecture and security controls explained.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="liquid-glass rounded-2xl border border-white/10 overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-white hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-amber-400' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* CALL TO ACTION BANNER (Mughal Auth Style) */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="max-w-3xl mx-auto relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-[11px] font-mono text-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>INSTANT INITIALIZATION</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Ready to Control Your Software With <br />
              <span className="text-gradient-gold">
                Not Exe Auth?
              </span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
              Create an account in 30 seconds and generate your first protected application master secret.
            </p>
            <div className="pt-3">
              <Link
                to="/signup"
                className="btn-magnetic-primary inline-flex h-12 px-9 text-xs font-black tracking-wider uppercase items-center gap-2 shadow-glow-sm"
              >
                <span>Open Panel Now</span>
                <ChevronRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER (Mughal Auth Structured Footer) */}
      <footer className="border-t border-white/[0.08] bg-[#050608] py-14 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="md:col-span-2 space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <BrandMark size="sm" />
              </Link>
              <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
                Not Exe Auth is a modern software licensing control panel for applications, users, licenses, tokens, sessions, files, variables, and audit logs.
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://discord.gg/HrVXH3wNpj"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                >
                  <MessageSquare size={13} className="text-amber-400" />
                  <span>Discord Community</span>
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Navigate</div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <a href="#features" className="hover:text-amber-400 transition-colors">Features</a>
                <a href="#endpoints" className="hover:text-amber-400 transition-colors">API Commands</a>
                <a href="#infrastructure" className="hover:text-amber-400 transition-colors">System Status</a>
                <Link to="/docs" className="hover:text-amber-400 transition-colors">Docs</Link>
                <Link to="/shop" className="hover:text-amber-400 transition-colors">Shop</Link>
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white">Resources & Legal</div>
              <div className="flex flex-col gap-2 text-xs text-slate-400">
                <Link to="/login" className="hover:text-amber-400 transition-colors">Sign In</Link>
                <Link to="/signup" className="hover:text-amber-400 transition-colors">Create Account</Link>
                <Link to="/tos" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
                <Link to="/tos" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500 font-mono">
            <div>© {new Date().getFullYear()} NOT EXE AUTH. ALL RIGHTS RESERVED.</div>
            <div className="flex items-center gap-4 text-emerald-400 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
