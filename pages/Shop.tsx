import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, set } from 'firebase/database';
import { Crown, Coins, MessageSquare, Check, Loader2, Zap, ShieldCheck, Sparkles, Layers, Cpu, Database, FileText, Webhook, Activity, Server, Users, Box, PlusCircle, ArrowUpRight, CheckCircle2, AlertTriangle, Calendar, Clock, X, Search, HelpCircle, Minus, Filter, ArrowRight, Shield, QrCode, Upload, Image as ImageIcon, Send, ExternalLink, Instagram, Plus } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { encrypt, decrypt } from '../services/encryption';
import { Customer, SystemPlan, BillingCycle, SubscriptionRecord, SubscriptionHistoryItem, CreditTopUpRequest, CreditPackage, PaymentConfig } from '../types';
import { SubscriptionConfig, calculateYearlySavings, getSubscriptionCountdown, checkAndDowngradeIfExpired, logSubscriptionEvent, sendInAppNotification } from '../services/subscriptionService';
import { ADMIN_EMAIL } from '../constants';

const DEFAULT_PLANS: Record<string, SystemPlan> = {
  'Free Plan': {
    maxApps: 2,
    maxUsers: 50,
    onSale: true,
    creditPrice: 0,
    monthlyPrice: 0,
    yearlyPrice: 0,
    price: '$0',
    order: 1,
    features: ['multi_app', 'user_data']
  },
  'Starter Plan': {
    maxApps: 5,
    maxUsers: 250,
    onSale: true,
    creditPrice: 50,
    monthlyPrice: 50,
    yearlyPrice: 500,
    price: '50 Credits',
    order: 2,
    features: ['multi_app', 'user_data', 'webhooks']
  },
  'Pro Plan': {
    maxApps: 15,
    maxUsers: 1000,
    onSale: true,
    creditPrice: 150,
    monthlyPrice: 150,
    yearlyPrice: 1500,
    price: '150 Credits',
    order: 3,
    features: ['multi_app', 'user_data', 'webhooks', 'cloud_vars']
  },
  'Enterprise Plan': {
    maxApps: -1,
    maxUsers: -1,
    onSale: true,
    creditPrice: 300,
    monthlyPrice: 300,
    yearlyPrice: 3000,
    price: '300 Credits',
    order: 4,
    features: ['multi_app', 'user_data', 'webhooks', 'cloud_vars', 'reseller']
  }
};

const CREDIT_PACKAGES = [
  {
    id: 'starter_pack',
    name: 'Starter Pack',
    credits: 50,
    priceINR: 499,
    popular: false,
    recommendedFor: 'Starter Plan (Monthly)',
    badge: 'Standard',
    order: 1
  },
  {
    id: 'pro_pack',
    name: 'Pro Infrastructure Pack',
    credits: 150,
    priceINR: 1299,
    popular: true,
    recommendedFor: 'Pro Plan (Monthly)',
    badge: 'Popular • Save 13%',
    order: 2
  },
  {
    id: 'enterprise_pack',
    name: 'Enterprise Pack',
    credits: 300,
    priceINR: 2499,
    popular: false,
    recommendedFor: 'Enterprise Plan (Monthly)',
    badge: 'Best Scale',
    order: 3
  },
  {
    id: 'scale_pack',
    name: 'Developer Scale Pack',
    credits: 500,
    priceINR: 3999,
    popular: false,
    recommendedFor: 'Multi-App Scale',
    badge: 'Save 20%',
    order: 4
  },
  {
    id: 'yearly_pack',
    name: 'Annual Infrastructure Pack',
    credits: 1500,
    priceINR: 9999,
    popular: false,
    recommendedFor: 'Yearly Subscriptions',
    badge: 'Ultimate Value',
    order: 5
  }
];

interface FeatureMeta {
  id: string;
  name: string;
  category: 'Infrastructure' | 'Authentication' | 'Developer Tools' | 'Automation' | 'Business';
  description: string;
  example: string;
}

const FEATURE_CATALOG: Record<string, FeatureMeta> = {
  'maxApps': {
    id: 'maxApps',
    name: 'Applications Limit',
    category: 'Infrastructure',
    description: 'The maximum number of separate software applications you can register and manage.',
    example: 'Deploy distinct auth configs for Windows Launcher, Web Portal, and Mobile App.'
  },
  'maxUsers': {
    id: 'maxUsers',
    name: 'User Capacity',
    category: 'Infrastructure',
    description: 'Total active registered user accounts across all your applications.',
    example: 'Support up to 1,000 active customer user accounts concurrently.'
  },
  'cloud_vars': {
    id: 'cloud_vars',
    name: 'Cloud Variables Engine',
    category: 'Authentication',
    description: 'Store encrypted server-side variables fetched dynamically at runtime without client updates.',
    example: 'Update API keys or server IP addresses instantly across all live app clients.'
  },
  'multi_app': {
    id: 'multi_app',
    name: 'Multi-App Support',
    category: 'Infrastructure',
    description: 'Manage multiple independent applications under a single developer account.',
    example: 'Run a suite of software products with isolated user databases.'
  },
  'webhooks': {
    id: 'webhooks',
    name: 'Realtime Webhooks',
    category: 'Automation',
    description: 'Receive instant HTTP POST event notifications on user logins, registrations, and license expires.',
    example: 'Send Discord alerts or trigger server workflows when a new customer registers.'
  },
  'reseller': {
    id: 'reseller',
    name: 'Reseller Portal',
    category: 'Business',
    description: 'Grant sub-admins permission to generate licenses and manage users under strict limits.',
    example: 'Allow sales affiliates to sell software keys directly without exposing master secret keys.'
  },
  'user_data': {
    id: 'user_data',
    name: 'Export & Import Data',
    category: 'Developer Tools',
    description: 'Download complete JSON/CSV database exports of user records and HWID locks.',
    example: 'Backup your entire user database or migrate to custom data warehouses.'
  },
  'import_users': {
    id: 'import_users',
    name: 'Bulk User Import',
    category: 'Developer Tools',
    description: 'Import existing user account databases seamlessly via bulk CSV/JSON payloads.',
    example: 'Migrate users from legacy auth platforms into DeepXAuth in seconds.'
  },
  'priority_support': {
    id: 'priority_support',
    name: 'Priority Support',
    category: 'Business',
    description: 'Direct access to senior engineers via priority Discord tickets and dedicated SLA.',
    example: 'Get 15-minute response times for critical production outages.'
  },
  'discord_sync': {
    id: 'discord_sync',
    name: 'Discord Role Sync',
    category: 'Automation',
    description: 'Automatically grant or revoke Discord server roles based on active subscriptions.',
    example: 'Give premium subscribers exclusive access to VIP Discord channels.'
  },
  'hwid_lock': {
    id: 'hwid_lock',
    name: 'HWID Lock Enforcement',
    category: 'Authentication',
    description: 'Bind user accounts to specific hardware fingerprints to prevent account sharing.',
    example: 'Lock license execution to a single motherboard and CPU hardware hash.'
  },
  'version_check': {
    id: 'version_check',
    name: 'Version Check Gate',
    category: 'Authentication',
    description: 'Force clients to run the latest software version before granting access.',
    example: 'Block outdated client builds automatically when a new patch is deployed.'
  },
  'file_delivery': {
    id: 'file_delivery',
    name: 'Encrypted File Delivery',
    category: 'Authentication',
    description: 'Stream protected DLL or binary payloads directly into memory over SSL.',
    example: 'Stream cheat loader or plugin DLLs directly to client RAM without saving to disk.'
  },
  'developer_logs': {
    id: 'developer_logs',
    name: 'Developer Audit Logs',
    category: 'Developer Tools',
    description: 'Inspect full audit trace logs of all authentication requests, IP addresses, and failures.',
    example: 'Investigate brute-force login attempts or suspicious HWID reset requests.'
  },
  'analytics': {
    id: 'analytics',
    name: 'Realtime Analytics',
    category: 'Developer Tools',
    description: 'Monitor daily active users (DAU), peak login hours, and geographic distribution.',
    example: 'Visualize user retention trends and global active sessions live.'
  }
};

const getPlanIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('free')) return <Layers className="w-5 h-5 text-slate-400" />;
  if (n.includes('starter')) return <Zap className="w-5 h-5 text-[#8B5CF6]" />;
  if (n.includes('pro')) return <Sparkles className="w-5 h-5 text-[#A855F7]" />;
  if (n.includes('enterprise')) return <Crown className="w-5 h-5 text-amber-400" />;
  return <Cpu className="w-5 h-5 text-[#8B5CF6]" />;
};

const getFeatureBadge = (feature: string) => {
  switch (feature) {
    case 'webhooks':
      return { label: 'Webhooks', icon: <Webhook size={12} className="text-[#8B5CF6]" /> };
    case 'multi_app':
      return { label: 'Multiple Apps', icon: <Layers size={12} className="text-[#8B5CF6]" /> };
    case 'reseller':
      return { label: 'Reseller Portal', icon: <ShieldCheck size={12} className="text-[#8B5CF6]" /> };
    case 'cloud_vars':
      return { label: 'Cloud Variables', icon: <Database size={12} className="text-[#8B5CF6]" /> };
    case 'user_data':
      return { label: 'Export Users', icon: <FileText size={12} className="text-[#8B5CF6]" /> };
    default:
      return { label: feature, icon: <Check size={12} className="text-[#8B5CF6]" /> };
  }
};

const CreditTopUpPortalModal: React.FC<{
  customer: Customer | null;
  onClose: () => void;
}> = ({ customer, onClose }) => {
  const [packages, setPackages] = useState<CreditPackage[]>(CREDIT_PACKAGES);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    upiId: 'deepxauth@upi',
    qrImageUrl: '',
    discordUrl: 'https://discord.gg/HrVXH3wNpj',
    instagramUrl: 'https://instagram.com/'
  });
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage>(CREDIT_PACKAGES[1]);
  const [qrRevealed, setQrRevealed] = useState(false);
  const [screenshotBase64, setScreenshotBase64] = useState<string>('');
  const [userNote, setUserNote] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    onValue(ref(db, 'system/creditPackages'), (snap) => {
      const raw = snap.val() || {};
      const list: CreditPackage[] = [];
      Object.keys(raw).forEach(k => {
        const p = decrypt(raw[k]);
        if (p && typeof p === 'object') list.push(p);
      });
      if (list.length > 0) {
        list.sort((a, b) => (a.order || 0) - (b.order || 0));
        setPackages(list);
        setSelectedPkg(list[0]);
      }
    });

    onValue(ref(db, 'system/paymentConfig'), (snap) => {
      const raw = snap.val();
      if (raw) {
        const dec = decrypt(raw);
        if (dec && typeof dec === 'object') {
          setPaymentConfig(dec);
        }
      }
    });
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotBase64(reader.result as string);
        setValidationError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser?.email) return;

    if (!screenshotBase64 && !userNote.trim()) {
      setValidationError("Please attach a payment proof screenshot or enter a transaction reference note before submitting.");
      return;
    }
    setValidationError(null);

    setSubmitting(true);
    try {
      const reqId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const payload: CreditTopUpRequest = {
        id: reqId,
        userEmail: auth.currentUser.email,
        userSecret: customer?.secret || '',
        creditsRequested: selectedPkg.credits,
        priceINR: selectedPkg.priceINR,
        selectedPackage: selectedPkg.name,
        note: userNote,
        screenshotBase64,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      await set(ref(db, `system/creditRequests/${reqId}`), encrypt(payload));
      await sendInAppNotification(auth.currentUser.email, 'Payment Submitted', `Your payment proof for ${selectedPkg.name} (${selectedPkg.credits} Credits / ₹${selectedPkg.priceINR}) has been submitted. Credits will be served within 12 hours.`, 'info');
      
      setSubmittedSuccess(true);
    } catch (err) {
      alert("Failed to submit payment proof. Please try again or contact via Discord.");
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[250] bg-[#07080C]/95 backdrop-blur-2xl overflow-y-auto p-4 sm:p-8 animate-fade-in custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* HEADER BAR */}
        <div className="sticky top-0 z-40 bg-[#07080C]/90 backdrop-blur-xl pt-4 pb-6 border-b border-white/[0.08] flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
              <Coins size={14} /> Credit Top-Up Portal
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">Purchase Infrastructure Credits</h1>
            <p className="text-xs text-[#9CA3AF] mt-1">Select a credit package, pay via UPI QR, or connect directly via Discord/Instagram.</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-[#8B5CF6]/10 px-4 py-2 rounded-2xl border border-[#8B5CF6]/30 text-xs font-bold text-[#8B5CF6]">
              <span>Current Balance:</span>
              <span className="font-mono font-black text-white">{customer?.credits || 0} PTS</span>
            </div>
            <button onClick={onClose} className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SUCCESS SUBMISSION STATE */}
        {submittedSuccess ? (
          <div className="p-10 rounded-3xl bg-[rgba(18,20,28,0.8)] border border-[#22C55E]/30 backdrop-blur-2xl shadow-2xl text-center space-y-6 animate-scale-up max-w-xl mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#22C55E] flex items-center justify-center mx-auto shadow-xl">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-tight">Payment Proof Submitted 🎉</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your payment screenshot and details for <strong className="text-white">{selectedPkg.name} ({selectedPkg.credits} PTS)</strong> have been received successfully.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#22C55E]/05 border border-[#22C55E]/20 text-xs font-semibold text-[#22C55E] flex items-center justify-center gap-2">
              <Clock size={16} /> SLA Notice: Your credits will be credited & served within 12 hours.
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => setSubmittedSuccess(false)}
                className="flex-1 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Submit Another Request
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* SECTION 1: PRICING PER PLAN & DURATION IN INR */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                  <Zap size={14} className="text-[#8B5CF6]" /> 1. Select Infrastructure Credit Package (INR ₹)
                </div>
                <span className="text-[11px] text-slate-400">All prices in Indian Rupees (INR)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {packages.map((pkg) => {
                  const isSelected = selectedPkg.id === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPkg(pkg)}
                      className={`p-5 rounded-2xl border cursor-pointer transition-all duration-300 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-b from-[#8B5CF6]/20 via-[#12141c] to-[#07080C] border-[#8B5CF6] shadow-[0_10px_30px_rgba(139,92,246,0.2)] -translate-y-1'
                          : 'bg-[rgba(18,20,28,0.6)] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.03]'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute top-0 right-0 bg-[#8B5CF6] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-md">
                          Popular
                        </div>
                      )}

                      <div className="space-y-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">{pkg.badge}</span>
                        <h3 className="text-base font-bold text-white tracking-tight">{pkg.name}</h3>
                        
                        <div className="text-2xl font-black font-mono text-white flex items-baseline gap-1">
                          <span>{pkg.credits}</span>
                          <span className="text-xs font-bold text-[#8B5CF6]">PTS</span>
                        </div>

                        <div className="text-xl font-black text-emerald-400 font-mono">
                          ₹{pkg.priceINR.toLocaleString()}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10 text-[10px] text-slate-400 font-medium">
                        For: {pkg.recommendedFor}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: PAYMENT METHOD 1 - PAY NOW (INTERACTIVE QR CODE & PROOF SUBMISSION) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
              
              {/* Left Column: Interactive 3D Rolling-Out QR Code Card */}
              <div className="lg:col-span-5 p-7 rounded-3xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] backdrop-blur-2xl shadow-2xl glass-reflection space-y-6 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
                  <QrCode size={13} /> Payment Method 1 • Pay via UPI QR
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white tracking-tight">Scan UPI QR Code</h3>
                  <p className="text-xs text-slate-400">Pay <strong className="text-emerald-400">₹{selectedPkg.priceINR}</strong> for <strong className="text-white">{selectedPkg.name} ({selectedPkg.credits} PTS)</strong>.</p>
                </div>

                {/* 3D Rolling Out QR Card Reveal Area */}
                <div className="relative overflow-hidden rounded-2xl bg-black/50 border border-white/10 p-6 flex flex-col items-center justify-center min-h-[280px]">
                  {qrRevealed ? (
                    <div className="space-y-4 animate-scale-up">
                      {/* Generated High-Res UPI QR Code SVG Canvas or Custom Image */}
                      <div className="w-52 h-52 bg-white p-3 rounded-2xl shadow-2xl mx-auto flex items-center justify-center relative">
                        <img 
                          src={paymentConfig.qrImageUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=${paymentConfig.upiId || 'deepxauth@upi'}%26pn=DeepXAuth%26am=${selectedPkg.priceINR}%26cu=INR`}
                          alt="Payment QR Code"
                          className="w-full h-full object-contain rounded-xl"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="text-xs font-mono font-bold text-slate-300">UPI ID: <span className="text-purple-400 font-extrabold select-all">{paymentConfig.upiId || 'deepxauth@upi'}</span></div>
                        <div className="text-[10px] text-slate-400">Supports Google Pay, PhonePe, Paytm & all UPI apps.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center p-4">
                      <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-[#8B5CF6] flex items-center justify-center mx-auto shadow-xl animate-bounce">
                        <QrCode size={32} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">Payment QR Code Hidden</h4>
                        <p className="text-xs text-slate-400">Click below to roll out and expose the active payment QR Code.</p>
                      </div>
                      <button
                        onClick={() => setQrRevealed(true)}
                        className="py-3 px-6 rounded-2xl bg-white hover:bg-slate-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 mx-auto"
                      >
                        <Sparkles size={14} /> Reveal Payment QR Code
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/05 border border-amber-500/20 text-[11px] text-amber-300 font-medium flex items-center justify-center gap-1.5">
                  <Clock size={14} /> Requests served within 12 hours max.
                </div>
              </div>

              {/* Right Column: Upload Payment Screenshot & Request Note Form */}
              <div className="lg:col-span-7 p-7 rounded-3xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] backdrop-blur-2xl shadow-2xl glass-reflection space-y-6">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[10px] font-bold uppercase tracking-widest text-[#22C55E]">
                    <Upload size={13} /> Submit Payment Proof
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight">Verify Payment & Submit Request</h3>
                  <p className="text-xs text-slate-400">Attach your payment screenshot or transaction reference ID below.</p>
                </div>

                <form onSubmit={handleSubmitProof} className="space-y-5">
                  
                  {/* Selected Package Summary Box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400">Selected Package: </span>
                      <span className="font-bold text-white">{selectedPkg.name}</span>
                    </div>
                    <div className="font-mono font-black text-emerald-400 text-sm">
                      ₹{selectedPkg.priceINR} ({selectedPkg.credits} PTS)
                    </div>
                  </div>

                  {/* Upload Payment Screenshot Field */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#8B5CF6]" /> Upload Payment Screenshot
                    </label>
                    <div className="relative border-2 border-dashed border-white/10 hover:border-[#8B5CF6]/40 rounded-2xl p-4 text-center bg-white/[0.02] transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      {screenshotBase64 ? (
                        <div className="flex items-center justify-between gap-4">
                          <img src={screenshotBase64} alt="Screenshot Preview" className="h-16 w-16 object-cover rounded-xl border border-white/20 shadow-md" />
                          <div className="text-left flex-1">
                            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                              <Check size={14} /> Screenshot Uploaded
                            </div>
                            <span className="text-[10px] text-slate-400">Click box to replace screenshot image</span>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-2">
                          <Upload size={24} className="mx-auto text-slate-500" />
                          <div className="text-xs text-slate-300 font-medium">Click or drag & drop payment receipt screenshot</div>
                          <div className="text-[10px] text-slate-500">Supports PNG, JPG, JPEG (Max 5MB)</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Custom Note / UTR Transaction Ref Textarea */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Transaction Reference / Custom Note (Optional)
                    </label>
                    <textarea
                      value={userNote}
                      onChange={e => {
                        setUserNote(e.target.value);
                        if (e.target.value.trim()) setValidationError(null);
                      }}
                      placeholder="e.g. UTR / Ref No: 420918291029 or special instructions..."
                      rows={3}
                      className="w-full p-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6] font-mono"
                    />
                  </div>

                  {validationError && (
                    <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <AlertTriangle size={16} className="text-rose-400 flex-shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl bg-white hover:bg-slate-200 text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={16} className="animate-spin text-black" /> : <Send size={15} />}
                    Submit Payment Proof & Request Credits
                  </button>
                </form>
              </div>

            </div>

            {/* SECTION 3: DIRECT CONTACT / DM OPTIONS */}
            <div className="pt-6 border-t border-white/[0.08] space-y-4">
              <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] flex items-center gap-2">
                <MessageSquare size={14} className="text-[#8B5CF6]" /> 3. Payment Method 2 • Direct DM Support
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Discord DM / Server Ticket Option */}
                <a
                  href="https://discord.gg/HrVXH3wNpj"
                  target="_blank"
                  rel="noreferrer"
                  className="p-6 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-[#8B5CF6]/40 backdrop-blur-xl flex items-center justify-between group transition-all hover:-translate-y-1 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 text-[#5865F2] group-hover:scale-110 transition-transform">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors flex items-center gap-1.5">
                        Discord Ticket / DM Support <ExternalLink size={13} />
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Connect directly with senior engineers for manual verification.</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </a>

                {/* Instagram DM Option */}
                <a
                  href="https://instagram.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="p-6 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-pink-500/40 backdrop-blur-xl flex items-center justify-between group transition-all hover:-translate-y-1 shadow-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 group-hover:scale-110 transition-transform">
                      <Instagram size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-pink-400 transition-colors flex items-center gap-1.5">
                        Instagram Direct Message <ExternalLink size={13} />
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">Message us on Instagram for fast order processing.</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-slate-500 group-hover:text-white transition-colors shrink-0 ml-2" />
                </a>

              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

// Premium In-App Purchase Modal Component
const PurchaseFlowModal: React.FC<{
  modalState: {
    show: boolean;
    step: 'confirm' | 'processing' | 'success' | 'error_credits' | 'error_generic' | 'error_active' | 'add_credits';
    planName: string;
    planObj: SystemPlan | null;
    billingCycle: BillingCycle;
    purchasePrice: number;
    creditsDeducted?: number;
    expiryDateFormatted?: string;
  };
  customerCredits: number;
  onClose: () => void;
  onConfirmPurchase: () => void;
}> = ({ modalState, customerCredits, onClose, onConfirmPurchase }) => {
  if (!modalState.show) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#0c0d14] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl glass-reflection p-8 text-left animate-scale-up">
        
        {/* STEP 1: CONFIRMATION DIALOG */}
        {modalState.step === 'confirm' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6] shadow-lg">
                <Crown size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Confirm Subscription</h3>
                <p className="text-xs text-slate-400">Activate your authentication infrastructure tier.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You're about to subscribe to the <strong className="text-white">{modalState.planName}</strong> plan.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan Tier:</span>
                <span className="font-bold text-white">{modalState.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billing Cycle:</span>
                <span className="font-bold text-[#8B5CF6] uppercase">{modalState.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Price:</span>
                <span className="font-black font-mono text-white">{modalState.purchasePrice} Credits</span>
              </div>
              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 leading-relaxed">
                • Credits will be deducted immediately.<br />
                • Your subscription will activate instantly after a successful purchase.
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmPurchase}
                className="flex-1 py-3.5 rounded-2xl bg-white hover:bg-slate-200 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl"
              >
                Subscribe
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PROCESSING STATE */}
        {modalState.step === 'processing' && (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center mx-auto text-[#8B5CF6]">
              <Loader2 size={32} className="animate-spin text-[#8B5CF6]" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-white tracking-tight">Processing your subscription...</h3>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                Please wait while we verify your credits and activate your infrastructure.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS DIALOG */}
        {modalState.step === 'success' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#22C55E]/15 border border-[#22C55E]/30 flex items-center justify-center text-[#22C55E] shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Subscription Activated 🎉</h3>
                <p className="text-xs text-slate-400">Your infrastructure is ready to deploy.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Your subscription has been activated successfully.
            </p>

            <div className="p-4 rounded-2xl bg-[#22C55E]/05 border border-[#22C55E]/20 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan Tier:</span>
                <span className="font-bold text-white">{modalState.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Billing Cycle:</span>
                <span className="font-bold text-[#8B5CF6] uppercase">{modalState.billingCycle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credits Deducted:</span>
                <span className="font-black font-mono text-emerald-400">{modalState.creditsDeducted} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Subscription Status:</span>
                <span className="font-bold text-[#22C55E]">Active</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/10">
                <span className="text-slate-400">Expiry Date:</span>
                <span className="font-bold text-white">{modalState.expiryDateFormatted}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white hover:bg-slate-200 text-black font-black text-xs uppercase tracking-widest transition-all shadow-xl"
            >
              Done
            </button>
          </div>
        )}

        {/* ERROR: INSUFFICIENT CREDITS */}
        {modalState.step === 'error_credits' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Purchase Failed</h3>
                <p className="text-xs text-rose-400">Insufficient Credit Balance</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You don't have enough credits to purchase this subscription.
            </p>

            <div className="p-4 rounded-2xl bg-rose-500/05 border border-rose-500/20 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Required Credits:</span>
                <span className="font-mono font-bold text-white">{modalState.purchasePrice} PTS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Your Credit Balance:</span>
                <span className="font-mono font-bold text-rose-400">{customerCredits} PTS</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              OK
            </button>
          </div>
        )}

        {/* ERROR: GENERIC PURCHASE ERROR */}
        {modalState.step === 'error_generic' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Something Went Wrong</h3>
                <p className="text-xs text-slate-400">Transaction Exception</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              We couldn't complete your subscription. No credits were deducted.<br /><br />
              Please try again in a few moments.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              OK
            </button>
          </div>
        )}

        {/* ERROR: ALREADY SUBSCRIBED */}
        {modalState.step === 'error_active' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">Subscription Already Active</h3>
                <p className="text-xs text-slate-400">Current Infrastructure</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You already have an active subscription for the <strong className="text-white">{modalState.planName}</strong> plan.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-widest transition-all"
            >
              OK
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// Fullscreen Compare Plans Modal Component
const ComparePlansModal: React.FC<{
  plans: Record<string, SystemPlan>;
  customer: Customer | null;
  billingCycle: BillingCycle;
  setBillingCycle: (cycle: BillingCycle) => void;
  onClose: () => void;
  onBuyPlan: (name: string, plan: SystemPlan) => void;
  buying: string | null;
  onOpenCreditModal?: () => void;
}> = ({ plans, customer, billingCycle, setBillingCycle, onClose, onBuyPlan, buying, onOpenCreditModal }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [hoveredTooltip, setHoveredTooltip] = useState<string | null>(null);

  const sortedPlans = (Object.entries(plans) as [string, SystemPlan][])
    .sort((a, b) => (a[1].order || 0) - (b[1].order || 0));

  const activePlanName = customer?.plan || 'Free Plan';

  const categories = ['All', 'Infrastructure', 'Authentication', 'Developer Tools', 'Automation', 'Business'];

  const filteredFeatures = Object.keys(FEATURE_CATALOG).filter(key => {
    const f = FEATURE_CATALOG[key];
    if (!f) return false;
    const matchesCategory = activeCategory === 'All' || f.category === activeCategory;
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[200] bg-[#07080C]/95 backdrop-blur-2xl overflow-y-auto p-4 sm:p-8 animate-fade-in custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP STICKY HEADER */}
        <div className="sticky top-0 z-40 bg-[#07080C]/90 backdrop-blur-xl pt-4 pb-6 border-b border-white/[0.08] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6] mb-2">
              <Layers size={13} /> Infrastructure Comparison Matrix
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">Compare Infrastructure Plans</h1>
            <p className="text-xs text-[#9CA3AF] mt-1">Select the authentication infrastructure tier matching your application scale.</p>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
            {/* Credit Balance Badge & Portal Opener */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Coins size={15} className="text-amber-400" />
                <span>{customer?.credits ?? 0} PTS</span>
              </div>

              <button
                onClick={() => onOpenCreditModal?.()}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-1.5"
              >
                <Plus size={14} /> Add Credits
              </button>

              {/* Admin Instant Credits Shortcut */}
              {(auth.currentUser?.email === ADMIN_EMAIL || customer?.email === ADMIN_EMAIL) && (
                <button
                  onClick={async () => {
                    if (!customer) return;
                    const updated = { ...customer, credits: (customer.credits || 0) + 1000 };
                    const emailKey = customer.email.replace(/\./g, ',');
                    await set(ref(db, `customers/${emailKey}`), encrypt(updated));
                    await sendInAppNotification(customer.email, 'Admin Credits Added', 'Added +1,000 credits to admin account.', 'success');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1 transition-all"
                  title="Admin Override: Instant Refill +1,000 Credits"
                >
                  <Sparkles size={13} className="text-purple-400" /> +1K Admin
                </button>
              )}
            </div>

            {/* Billing Toggle */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  billingCycle === 'yearly' ? 'bg-[#8B5CF6] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Yearly</span>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E]">Save 17%</span>
              </button>
            </div>

            <button onClick={onClose} className="p-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white transition-all">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR & CATEGORY FILTER PILLS */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/20'
                    : 'bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search features (e.g. webhooks)..."
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/[0.08] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        </div>

        {/* SMART RECOMMENDATION BANNER */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/10 via-[#A855F7]/05 to-transparent border border-[#8B5CF6]/20 flex items-center gap-3 text-xs text-slate-300">
          <Sparkles size={18} className="text-[#8B5CF6] shrink-0" />
          <div>
            <span className="font-extrabold text-white">Smart Recommendation: </span>
            You are currently on <span className="font-bold text-[#22C55E]">{activePlanName}</span>. Upgrade to <span className="font-bold text-white">Pro Plan</span> for 3x App capacity, Cloud Variables, and Realtime Webhooks.
          </div>
        </div>

        {/* COMPARISON MATRIX TABLE */}
        <div className="overflow-x-auto rounded-3xl border border-white/[0.08] bg-[rgba(18,20,28,0.72)] backdrop-blur-2xl shadow-2xl glass-reflection">
          <table className="w-full text-left border-collapse min-w-[800px]">
            
            {/* STICKY PLAN HEADERS ROW */}
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                <th className="p-6 text-xs font-bold uppercase tracking-widest text-[#9CA3AF] w-1/4">
                  Capabilities & Features
                </th>
                {sortedPlans.map(([name, plan]) => {
                  const isCurrent = customer?.plan === name;
                  const monthlyP = plan.monthlyPrice || plan.creditPrice;
                  const yearlyP = plan.yearlyPrice || Math.round(monthlyP * 10);
                  const price = billingCycle === 'yearly' ? yearlyP : monthlyP;

                  return (
                    <th key={name} className={`p-6 text-center w-1/5 ${isCurrent ? 'bg-[#22C55E]/05 border-x border-[#22C55E]/30' : ''}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2">
                          {getPlanIcon(name)}
                          <span className="text-base font-extrabold text-white">{name}</span>
                        </div>

                        {/* Price */}
                        <div className="text-2xl font-black font-mono text-white">
                          {price} <span className="text-xs font-bold text-[#8B5CF6]">PTS</span>
                        </div>

                        {/* Action Button */}
                        <div>
                          {isCurrent ? (
                            <div className="py-2 px-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-black uppercase tracking-wider">
                              Current Plan
                            </div>
                          ) : (
                            <button
                              onClick={() => onBuyPlan(name, plan)}
                              disabled={buying === name}
                              className="w-full py-2.5 rounded-xl font-bold uppercase tracking-wider text-[11px] bg-white text-black hover:bg-slate-200 transition-all shadow-md"
                            >
                              {buying === name ? <Loader2 size={14} className="animate-spin mx-auto text-black" /> : 'Subscribe'}
                            </button>
                          )}
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* MATRIX BODY ROWS */}
            <tbody className="divide-y divide-white/[0.05]">
              {filteredFeatures.map(featKey => {
                const feat = FEATURE_CATALOG[featKey];
                if (!feat) return null;

                return (
                  <tr key={featKey} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Feature Title & Hover Tooltip */}
                    <td className="p-5">
                      <div className="flex items-center gap-2 relative">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">{feat.name}</span>
                        <div 
                          className="relative cursor-pointer"
                          onMouseEnter={() => setHoveredTooltip(featKey)}
                          onMouseLeave={() => setHoveredTooltip(null)}
                        >
                          <HelpCircle size={13} className="text-slate-500 group-hover:text-[#8B5CF6] transition-colors" />
                          
                          {/* Rich Hover Card Tooltip */}
                          {hoveredTooltip === featKey && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-72 p-4 rounded-2xl bg-[#0c0d14] border border-white/20 shadow-2xl space-y-2 text-left animate-fade-in backdrop-blur-xl">
                              <div className="text-xs font-black text-white flex items-center gap-1.5">
                                <Sparkles size={14} className="text-[#8B5CF6]" /> {feat.name}
                              </div>
                              <p className="text-[11px] text-slate-300 font-normal leading-relaxed">{feat.description}</p>
                              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-purple-300 font-mono">
                                <strong className="text-white">Example: </strong>{feat.example}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Plan Values */}
                    {sortedPlans.map(([name, plan]) => {
                      const isCurrent = customer?.plan === name;
                      let cellContent: React.ReactNode = null;

                      if (featKey === 'maxApps') {
                        cellContent = (
                          <div className="font-mono font-bold text-xs text-white">
                            {plan.maxApps === -1 ? '∞ Unlimited' : `${plan.maxApps} Apps`}
                          </div>
                        );
                      } else if (featKey === 'maxUsers') {
                        cellContent = (
                          <div className="font-mono font-bold text-xs text-white">
                            {plan.maxUsers === -1 ? '∞ Unlimited' : `${plan.maxUsers} Users`}
                          </div>
                        );
                      } else {
                        const isIncluded = plan.features?.includes(featKey);
                        cellContent = isIncluded ? (
                          <CheckCircle2 size={18} className="text-[#22C55E] mx-auto" />
                        ) : (
                          <Minus size={16} className="text-slate-600 mx-auto" />
                        );
                      }

                      return (
                        <td key={name} className={`p-5 text-center ${isCurrent ? 'bg-[#22C55E]/05 border-x border-[#22C55E]/20' : ''}`}>
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {filteredFeatures.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                    No features match your search filter.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>

      </div>
    </div>
  );
};

const Shop: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [plans, setPlans] = useState<Record<string, SystemPlan>>({});
  const [buying, setBuying] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [nowTick, setNowTick] = useState(Date.now());
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showCreditPortalModal, setShowCreditPortalModal] = useState(false);

  // In-App Purchase Modal Suite State
  const [purchaseModal, setPurchaseModal] = useState<{
    show: boolean;
    step: 'confirm' | 'processing' | 'success' | 'error_credits' | 'error_generic' | 'error_active' | 'add_credits';
    planName: string;
    planObj: SystemPlan | null;
    billingCycle: BillingCycle;
    purchasePrice: number;
    creditsDeducted?: number;
    expiryDateFormatted?: string;
  }>({
    show: false,
    step: 'confirm',
    planName: '',
    planObj: null,
    billingCycle: 'monthly',
    purchasePrice: 0
  });

  // Real-time countdown clock without forcing full page reload
  useEffect(() => {
    const interval = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!auth.currentUser?.email) return;
    const emailKey = auth.currentUser.email.replace(/\./g, ',');

    onValue(ref(db, `customers/${emailKey}`), async (snap) => {
      let rawData = decrypt(snap.val());
      
      if (!rawData || typeof rawData !== 'object' || !rawData.email) {
        // Auto-initialize customer record if missing in Firebase
        const initialCustomer: Customer = {
          email: auth.currentUser!.email!,
          secret: `DXA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          plan: 'Free Plan',
          credits: 500, // Grant 500 initial test credits for instant testing
          createdAt: new Date().toISOString(),
          subscription: {
            plan: 'Free Plan',
            billingCycle: 'monthly',
            purchasePrice: 0,
            activatedAt: Date.now(),
            expiresAt: null,
            status: 'active',
            autoDowngrade: true
          }
        };
        try {
          await set(ref(db, `customers/${emailKey}`), encrypt(initialCustomer));
          setCustomer(initialCustomer);
        } catch (e) {
          console.warn("Auto-customer init error:", e);
        }
      } else {
        // Expiry Engine: Check & Auto-Downgrade if expired
        const { downgraded, updatedCustomer } = await checkAndDowngradeIfExpired(rawData);
        if (downgraded && updatedCustomer) {
          setCustomer(updatedCustomer);
        } else {
          setCustomer(rawData);
        }
      }
    });

    onValue(ref(db, `system/plans`), async (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, SystemPlan> = {};
      Object.keys(raw).forEach(k => {
        const p = decrypt(raw[k]);
        if (p && p.onSale) dec[k] = p;
      });

      if (Object.keys(dec).length === 0) {
        setPlans(DEFAULT_PLANS);
        // Seed default plans into Firebase
        const seedPayload: Record<string, any> = {};
        Object.keys(DEFAULT_PLANS).forEach(pName => {
          seedPayload[pName] = encrypt(DEFAULT_PLANS[pName]);
        });
        try {
          await set(ref(db, `system/plans`), seedPayload);
        } catch (e) {
          console.warn("Auto plan seed error:", e);
        }
      } else {
        setPlans(dec);
      }
    });
  }, []);

  // Step 1: Open Confirmation Modal
  const initiateBuyPlan = (name: string, plan: SystemPlan) => {
    if (!auth.currentUser?.email) return;

    // Use current state or construct fallback on the fly
    const activeCust: Customer = customer || {
      email: auth.currentUser.email,
      secret: `DXA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      plan: 'Free Plan',
      credits: 500,
      createdAt: new Date().toISOString()
    };

    if (activeCust.plan === name) {
      setPurchaseModal({
        show: true,
        step: 'error_active',
        planName: name,
        planObj: plan,
        billingCycle,
        purchasePrice: 0
      });
      return;
    }

    const monthlyP = plan.monthlyPrice || plan.creditPrice;
    const yearlyP = plan.yearlyPrice || Math.round(monthlyP * 10);
    const purchasePrice = billingCycle === 'yearly' ? yearlyP : monthlyP;

    if ((activeCust.credits || 0) < purchasePrice) {
      setPurchaseModal({
        show: true,
        step: 'error_credits',
        planName: name,
        planObj: plan,
        billingCycle,
        purchasePrice
      });
      return;
    }

    setPurchaseModal({
      show: true,
      step: 'confirm',
      planName: name,
      planObj: plan,
      billingCycle,
      purchasePrice
    });
  };

  // Step 2 & 3: Execute Purchase in Processing state -> Show Success / Error Modal
  const executeConfirmedPurchase = async () => {
    const { planName: name, planObj: plan, purchasePrice } = purchaseModal;
    if (!customer || !auth.currentUser?.email || !plan) return;

    setPurchaseModal(prev => ({ ...prev, step: 'processing' }));
    setBuying(name);

    try {
      const durationMs = billingCycle === 'yearly' ? SubscriptionConfig.YEARLY_MS : SubscriptionConfig.MONTHLY_MS;
      const activatedAt = Date.now();
      const expiresAt = name === 'Free Plan' ? null : activatedAt + durationMs;
      const emailKey = customer.email.replace(/\./g, ',');

      const newSubscriptionRecord: SubscriptionRecord = {
        plan: name,
        billingCycle: billingCycle,
        purchasePrice: purchasePrice,
        activatedAt: activatedAt,
        expiresAt: expiresAt,
        status: 'active',
        autoDowngrade: true
      };

      const historyItem: SubscriptionHistoryItem = {
        plan: name,
        billingCycle: billingCycle,
        purchasePrice: purchasePrice,
        activatedAt: activatedAt,
        expiresAt: expiresAt,
        status: 'active',
        type: customer.plan === name ? 'renewal' : (name === 'Free Plan' ? 'downgrade' : 'upgrade')
      };

      const updatedCustomer: Customer = {
        ...customer,
        email: customer.email || auth.currentUser.email || '',
        secret: customer.secret || `DXA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        credits: Math.max(0, (customer.credits || 0) - purchasePrice),
        plan: name,
        createdAt: customer.createdAt || new Date().toISOString(),
        subscription: newSubscriptionRecord,
        subscriptionHistory: [...(customer.subscriptionHistory || []), historyItem]
      };

      await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
      logSubscriptionEvent(customer.email, customer.secret || '', customer.plan, name, customer.subscription?.status || 'active', 'active', `User purchased ${name} (${billingCycle}) for ${purchasePrice} credits`, 'user').catch(e => console.warn("Log event ignored:", e));
      sendInAppNotification(customer.email, 'Subscription Activated', `Your ${name} (${billingCycle}) subscription is now active!`, 'success').catch(e => console.warn("Notification ignored:", e));

      const countdown = getSubscriptionCountdown(expiresAt);
      setPurchaseModal({
        show: true,
        step: 'success',
        planName: name,
        planObj: plan,
        billingCycle,
        purchasePrice,
        creditsDeducted: purchasePrice,
        expiryDateFormatted: name === 'Free Plan' ? 'Lifetime Free' : countdown.formattedExpiry
      });
    } catch (err) {
      setPurchaseModal({
        show: true,
        step: 'error_generic',
        planName: name,
        planObj: plan,
        billingCycle,
        purchasePrice
      });
    }
    setBuying(null);
  };

  // Find active plan parameters & countdown for overview
  const activePlanName = customer?.plan || 'Free Plan';
  const activePlanObj = plans[activePlanName] || DEFAULT_PLANS[activePlanName] || DEFAULT_PLANS['Free Plan'];
  const countdown = getSubscriptionCountdown(customer?.subscription?.expiresAt);

  return (
    <div className="min-h-screen bg-[#07080C] text-white selection:bg-[#8B5CF6]/30 font-sans overflow-x-hidden relative">
      {/* Deep Space Cosmic Canvas Background */}
      <div className="fixed inset-0 pointer-events-none grid-bg opacity-20" />
      <div className="fixed top-[-15%] left-[20%] w-[700px] h-[700px] bg-[#8B5CF6]/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[15%] w-[600px] h-[600px] bg-[#A855F7]/08 blur-[160px] rounded-full pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(7,8,12,0.85)_100%)]" />

      {/* Floating Glass Navigation Bar */}
      <nav className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <div className="w-full max-w-6xl bg-[rgba(18,20,28,0.8)] backdrop-blur-2xl rounded-full border border-white/[0.08] px-6 py-3 flex justify-between items-center shadow-2xl glass-reflection">
          <Link to="/" className="flex items-center gap-3 effect-magnetic">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-white via-slate-200 to-[#8B5CF6] text-black font-black flex items-center justify-center text-xs shadow-md">DXA</div>
            <span className="font-bold text-xs uppercase tracking-widest text-white">Infrastructure Platform</span>
          </Link>
          <div className="flex items-center gap-5">
            <button 
              onClick={() => setShowCreditPortalModal(true)}
              className="flex items-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 px-4 py-1.5 rounded-full border border-[#8B5CF6]/30 text-xs font-bold text-[#8B5CF6] effect-repulsive cursor-pointer shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all"
            >
              <Coins className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>{customer?.credits || 0} Credits</span>
            </button>
            <Link to="/dashboard" className="text-xs font-semibold tracking-wider text-slate-400 hover:text-white transition-colors effect-magnetic">Dashboard</Link>
          </div>
        </div>
      </nav>

      {/* Main Infrastructure Workspace */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in relative z-10">
        
        {/* HERO SECTION */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-16 pb-12 border-b border-white/[0.08]">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-bold uppercase tracking-widest text-[#8B5CF6] backdrop-blur-md shadow-xl">
              <Activity className="w-3.5 h-3.5 text-[#8B5CF6]" />
              <span>AUTHENTICATION INFRASTRUCTURE CENTER</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-2xl">
              Infrastructure Center
            </h1>
            <p className="text-[#9CA3AF] text-base font-normal leading-relaxed">
              Scale your authentication platform with Credits.
            </p>
          </div>

          {/* Credits Balance Card (Right Hero Side) */}
          <div className="w-full md:w-auto p-6 rounded-3xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] backdrop-blur-xl shadow-2xl flex flex-col justify-between min-w-[280px] glass-reflection group">
            <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Credits Balance</span>
              <div className="p-2 rounded-xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                <Coins size={18} />
              </div>
            </div>
            <div className="text-3xl font-black text-white font-mono tracking-tight mb-4">
              {customer?.credits || 0} <span className="text-xs font-bold text-[#8B5CF6] font-sans">PTS</span>
            </div>
            <button 
              onClick={() => setShowCreditPortalModal(true)}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-[#8B5CF6]/30 transition-all flex items-center justify-center gap-2 effect-magnetic"
            >
              <PlusCircle size={15} /> Add Credits Portal
            </button>
          </div>
        </div>

        {/* INFRASTRUCTURE OVERVIEW (5 Glass Cards with Subscription Intelligence) */}
        <div className="mb-16">
          <div className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-[#8B5CF6]" /> Infrastructure Overview
            </div>
            {countdown.isExpiringSoon && (
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30 animate-pulse">
                <AlertTriangle size={14} /> Infrastructure expires in {countdown.daysLeft} days. Renew now.
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Card 1: Current Plan & Subscription Duration */}
            <div className="p-5 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-[#8B5CF6]/30 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Current Plan</span>
                <Server size={18} className="text-[#22C55E] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-lg font-bold text-white truncate">{activePlanName}</div>
              <div className="text-[10px] text-[#9CA3AF] mt-1 font-medium flex items-center gap-1">
                <Clock size={11} className="text-[#8B5CF6]" />
                {activePlanName === 'Free Plan' ? 'Permanent Free' : `${countdown.daysLeft} Days Left • ${customer?.subscription?.billingCycle || 'Monthly'}`}
              </div>
            </div>

            {/* Card 2: Applications */}
            <div className="p-5 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-[#8B5CF6]/30 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Applications</span>
                <Box size={18} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {activePlanObj?.maxApps === -1 ? 'Unlimited' : activePlanObj?.maxApps}
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 font-medium">Deployed app limit</span>
            </div>

            {/* Card 3: Users */}
            <div className="p-5 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-[#8B5CF6]/30 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Users</span>
                <Users size={18} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {activePlanObj?.maxUsers === -1 ? 'Unlimited' : activePlanObj?.maxUsers}
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 font-medium">Total auth capacity</span>
            </div>

            {/* Card 4: Expiry Date */}
            <div className="p-5 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-[#8B5CF6]/30 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Expiry Date</span>
                <Calendar size={18} className="text-[#8B5CF6] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-sm font-bold text-white truncate">
                {activePlanName === 'Free Plan' ? 'Never' : countdown.formattedExpiry}
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 font-medium">
                {activePlanName === 'Free Plan' ? 'Lifetime Free Tier' : `Auto-downgrade active`}
              </span>
            </div>

            {/* Card 5: Infrastructure Status */}
            <div className="p-5 rounded-2xl bg-[rgba(18,20,28,0.72)] border border-white/[0.08] hover:border-[#22C55E]/30 backdrop-blur-xl flex flex-col justify-between shadow-xl transition-all hover:-translate-y-1 group">
              <div className="flex items-center justify-between text-[#9CA3AF] mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider">Status</span>
                <CheckCircle2 size={18} className="text-[#22C55E] group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-lg font-bold text-[#22C55E] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" /> Operational
              </div>
              <span className="text-[10px] text-[#9CA3AF] mt-1 font-medium">Global nodes healthy</span>
            </div>

          </div>
        </div>

        {/* AVAILABLE INFRASTRUCTURE UPGRADES & BILLING CYCLE TOGGLE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Available Infrastructure Upgrades</h2>
            <p className="text-[#9CA3AF] text-xs mt-1">Select your preferred subscription cycle to calculate pricing and automatic renewal terms.</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setShowCompareModal(true)}
              className="px-4 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5 effect-magnetic"
            >
              <Layers size={14} className="text-[#8B5CF6]" /> Compare Plans
            </button>

            {/* Billing Cycle Selector Toggle */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#8B5CF6] text-[#ffffff] shadow-lg shadow-[#8B5CF6]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-[#8B5CF6] text-[#ffffff] shadow-lg shadow-[#8B5CF6]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Yearly Billing</span>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30">
                  Save 17%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* PLAN CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {(Object.entries(plans) as [string, SystemPlan][])
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([name, plan]) => {
              const isCurrent = customer?.plan === name;
              
              const monthlyP = plan.monthlyPrice || plan.creditPrice;
              const yearlyP = plan.yearlyPrice || Math.round(monthlyP * 10);
              const displayPrice = billingCycle === 'yearly' ? yearlyP : monthlyP;
              const savings = calculateYearlySavings(monthlyP, yearlyP);

              return (
                <div 
                  key={name} 
                  className={`p-7 rounded-[24px] bg-[rgba(18,20,28,0.72)] border flex flex-col justify-between group relative overflow-hidden transition-all duration-300 backdrop-blur-xl glass-reflection ${
                    isCurrent 
                      ? 'border-[#22C55E]/40 shadow-[0_20px_50px_rgba(34,197,94,0.12)] bg-gradient-to-b from-[#22C55E]/05 via-[rgba(18,20,28,0.85)] to-[#07080C]' 
                      : 'border-white/[0.08] hover:border-[#8B5CF6]/40 hover:shadow-[0_25px_60px_rgba(139,92,246,0.12)] hover:-translate-y-1'
                  }`}
                >
                  {/* Accent Glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/05 blur-3xl rounded-full pointer-events-none group-hover:bg-[#8B5CF6]/15 transition-all" />

                  <div>
                    {/* Top: Icon, Plan Name & Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/[0.08] group-hover:border-[#8B5CF6]/30 transition-all shadow-inner">
                          {getPlanIcon(name)}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white tracking-tight">{name}</h3>
                          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest">Infrastructure</span>
                        </div>
                      </div>
                      
                      {isCurrent ? (
                        <div className="flex items-center gap-1.5 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-[0_0_12px_rgba(34,197,94,0.2)] animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="bg-white/[0.05] border border-white/[0.08] text-[#9CA3AF] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                          Public
                        </div>
                      )}
                    </div>

                    {/* Middle: Dynamic Subscription Price */}
                    <div className="mb-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-1">
                        <span>{billingCycle === 'yearly' ? 'Yearly Price' : 'Monthly Price'}</span>
                        {billingCycle === 'yearly' && savings.savingsPercent > 0 && (
                          <span className="text-[9px] font-extrabold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-md border border-[#22C55E]/20">
                            Save {savings.savingsPercent}%
                          </span>
                        )}
                      </div>
                      <div className="text-4xl lg:text-5xl font-black text-white flex items-baseline gap-2 font-mono tracking-tight">
                        <span>{displayPrice}</span>
                        <span className="text-xs font-bold text-[#8B5CF6] uppercase tracking-wider font-sans">Credits</span>
                      </div>
                    </div>

                    {/* Quota Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Apps</div>
                        <div className="text-sm font-black text-white mt-0.5">{plan.maxApps === -1 ? 'Unlimited' : plan.maxApps}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                        <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Users</div>
                        <div className="text-sm font-black text-white mt-0.5">{plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</div>
                      </div>
                    </div>

                    {/* Feature Pills */}
                    <div className="space-y-2 mb-8">
                      <div className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-widest mb-2">Modules & Capabilities</div>
                      <div className="flex flex-wrap gap-1.5">
                        {plan.features?.map(feature => {
                          const badge = getFeatureBadge(feature);
                          return (
                            <div key={feature} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-slate-300 font-semibold group-hover:border-white/10 transition-colors">
                              {badge.icon}
                              <span>{badge.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Button or Current Plan Badge */}
                  <div>
                    {isCurrent ? (
                      <div className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(34,197,94,0.15)] animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                        <span>Current Infrastructure</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => initiateBuyPlan(name, plan)}
                        disabled={buying === name}
                        className="w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all duration-300 bg-white text-black hover:bg-slate-200 effect-magnetic shadow-lg"
                      >
                        {buying === name ? (
                          <Loader2 className="animate-spin mx-auto text-black" size={18} />
                        ) : displayPrice === 0 ? (
                          'Switch to Free Plan'
                        ) : (
                          `Subscribe (${billingCycle})`
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          
          {Object.keys(plans).length === 0 && (
            <div className="col-span-full py-20 text-center bg-[rgba(18,20,28,0.72)] rounded-3xl p-12 text-[#9CA3AF] font-bold uppercase tracking-widest text-xs border border-white/[0.08]">
              No infrastructure plans available.
            </div>
          )}
        </div>

        {/* DEVELOPER REWARDS SECTION */}
        <div className="mt-16 bg-[rgba(18,20,28,0.72)] p-10 rounded-[32px] border border-white/[0.08] text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden glass-reflection group backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#8B5CF6]/10 via-[#A855F7]/05 to-[#8B5CF6]/10 pointer-events-none group-hover:opacity-100 transition-opacity" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[10px] font-bold uppercase tracking-widest text-[#8B5CF6]">
              <Coins size={13} /> Developer Rewards & Bounties
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Earn Free Infrastructure Credits</h2>
            <p className="text-[#9CA3AF] text-xs sm:text-sm max-w-lg mx-auto font-normal leading-relaxed">
              Join our developer community on Discord to claim bonus credits through daily events, bug bounties, and rewards.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setShowCreditPortalModal(true)}
                className="bg-white text-black hover:bg-slate-200 effect-magnetic inline-flex items-center gap-2.5 px-8 py-3.5 text-xs uppercase font-extrabold tracking-wider rounded-2xl shadow-xl"
              >
                <Coins size={16} /> Open Credit Top-Up Portal <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* PREMIUM CREDIT TOP-UP PORTAL MODAL */}
      {showCreditPortalModal && (
        <CreditTopUpPortalModal
          customer={customer}
          onClose={() => setShowCreditPortalModal(false)}
        />
      )}

      {/* PREMIUM IN-APP PURCHASE MODAL SUITE */}
      <PurchaseFlowModal
        modalState={purchaseModal}
        customerCredits={customer?.credits || 0}
        onClose={() => setPurchaseModal(prev => ({ ...prev, show: false }))}
        onConfirmPurchase={executeConfirmedPurchase}
      />

      {/* FULLSCREEN COMPARE PLANS MODAL */}
      {showCompareModal && (
        <ComparePlansModal
          plans={plans}
          customer={customer}
          billingCycle={billingCycle}
          setBillingCycle={setBillingCycle}
          onClose={() => setShowCompareModal(false)}
          onBuyPlan={(name, plan) => {
            setShowCompareModal(false);
            initiateBuyPlan(name, plan);
          }}
          buying={buying}
          onOpenCreditModal={() => setShowCreditPortalModal(true)}
        />
      )}
    </div>
  );
};

export default Shop;
