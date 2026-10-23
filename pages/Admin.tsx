
import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ref, onValue, set, remove, get } from 'firebase/database';
import {
  Users, BarChart2, Box, LogOut, Trash2, Edit2,
  Plus, Coins, ShieldCheck, Mail, ArrowLeft, Loader2,
  Search, X, Key, Info, AlertTriangle, Crown, Settings,
  ArrowUp, ArrowDown, Hammer, GripVertical, Code, Eye, EyeOff,
  Maximize2, Minimize2, Check, Copy, Terminal, Github, Menu,
  Download, Upload, Filter, FileJson, Sparkles, Layers, Zap,
  Database, Lock, Server, Activity, Rocket, Clock, QrCode, Instagram, Image as ImageIcon, Send, CheckCircle2
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { auth, db } from '../services/firebase';
import { encrypt, decrypt } from '../services/encryption';
import { Customer, SystemPlan, SystemConfig, SDK, PlanVisibility, PlanAuditLog, CreditPackage, PaymentConfig, CreditTopUpRequest } from '../types';
import { ADMIN_EMAIL, DEFAULT_CREDIT_PACKAGES } from '../constants';
import { subscribeToSDKs, saveSDK, deleteSDK, toggleSDKVisibility } from '../services/sdkService';
import { adminExtendSubscription, adminSuspendSubscription, adminRestoreSubscription } from '../services/subscriptionService';
import { commandPaletteService } from '../services/commandPaletteService';
import { auditService } from '../services/auditService';

const Modal: React.FC<{ title: string, onClose: () => void, children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
    <div className="glass-card-premium border border-white/12 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] glass-reflection">
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-xl"><X size={18} /></button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

const SDKEditorModal: React.FC<{
  sdk: SDK | null;
  onClose: () => void;
  onSave: (sdk: SDK) => Promise<void>;
}> = ({ sdk, onClose, onSave }) => {
  const [name, setName] = useState(sdk?.name || '');
  const [language, setLanguage] = useState(sdk?.language || 'python');
  const [icon, setIcon] = useState(sdk?.icon || 'Code');
  const [githubUrl, setGithubUrl] = useState(sdk?.githubUrl || '');
  const [sdkCode, setSdkCode] = useState(sdk?.sdkCode || '');
  const [displayOrder, setDisplayOrder] = useState<number>(sdk?.displayOrder || 1);
  const [visible, setVisible] = useState<boolean>(sdk?.visible ?? true);
  const [badge, setBadge] = useState<string>(sdk?.badge || 'Stable');
  const [version, setVersion] = useState<string>(sdk?.version || 'v1.0.0');
  const [description, setDescription] = useState<string>(sdk?.description || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReadOnlyPreview, setIsReadOnlyPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !githubUrl || !sdkCode) return;
    setIsSaving(true);
    const id = sdk?.id || name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    await onSave({
      id,
      name,
      language,
      icon,
      githubUrl,
      sdkCode,
      displayOrder: Number(displayOrder),
      visible,
      badge,
      version,
      description,
      createdAt: sdk?.createdAt
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className={`glass-card-premium border border-white/10 rounded-3xl w-full flex flex-col transition-all duration-300 ${isFullscreen ? 'fixed inset-4 max-w-none h-[calc(100vh-2rem)]' : 'max-w-4xl max-h-[90vh]'}`}>

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Code size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">{sdk ? `Edit SDK: ${sdk.name}` : 'Register New SDK'}</h3>
              <p className="text-[11px] text-slate-400 font-medium">Database-driven SDK configuration with Monaco Code Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">SDK Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Python" className="input-saas w-full p-3 text-xs" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Language Syntax</label>
              <select value={language} onChange={e => setLanguage(e.target.value)} className="input-saas w-full p-3 text-xs bg-[#080a10]">
                <option value="python">Python</option>
                <option value="csharp">C# (.NET)</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="rust">Rust</option>
                <option value="go">Go</option>
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Display Order</label>
              <input type="number" value={displayOrder} onChange={e => setDisplayOrder(Number(e.target.value))} className="input-saas w-full p-3 text-xs" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Version</label>
              <input value={version} onChange={e => setVersion(e.target.value)} placeholder="e.g. v1.2.0" className="input-saas w-full p-3 text-xs" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Badge Tag</label>
              <select value={badge} onChange={e => setBadge(e.target.value)} className="input-saas w-full p-3 text-xs bg-[#080a10]">
                <option value="Stable">Stable</option>
                <option value="Beta">Beta</option>
                <option value="Experimental">Experimental</option>
                <option value="Coming Soon">Coming Soon</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Visibility Status</label>
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${visible ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
              >
                <span>{visible ? 'Visible (Published)' : 'Hidden (Draft)'}</span>
                {visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">GitHub Repository URL</label>
            <input value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/org/repo" className="input-saas w-full p-3 text-xs" required />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Short Description</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="One-line summary for docs and landing page" className="input-saas w-full p-3 text-xs" />
          </div>

          {/* Monaco Editor Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">SDK Source Code (Monaco Editor)</label>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded font-mono font-bold">{language}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsReadOnlyPreview(!isReadOnlyPreview)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-colors ${isReadOnlyPreview ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                >
                  {isReadOnlyPreview ? 'Preview Mode' : 'Edit Mode'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(sdkCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-slate-300 flex items-center gap-1"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1e1e1e] shadow-inner h-72">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={sdkCode}
                onChange={(val) => setSdkCode(val || '')}
                options={{
                  readOnly: isReadOnlyPreview,
                  minimap: { enabled: false },
                  fontSize: 12,
                  wordWrap: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  lineNumbers: 'on',
                }}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="btn-saas-secondary px-5 py-2.5 text-xs font-bold">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="btn-magnetic-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2">
              {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
              <span>Save SDK</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InfrastructurePlanEditorModal: React.FC<{
  planName: string;
  initialPlan: SystemPlan;
  onClose: () => void;
  onSave: (updatedPlan: SystemPlan) => Promise<void>;
}> = ({ planName, initialPlan, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'pricing' | 'limits' | 'features' | 'visibility' | 'advanced'>('general');
  const [saving, setSaving] = useState(false);

  const [draft, setDraft] = useState<SystemPlan>({
    maxApps: initialPlan.maxApps ?? 5,
    maxUsers: initialPlan.maxUsers ?? 100,
    onSale: initialPlan.onSale ?? true,
    creditPrice: initialPlan.monthlyPrice || initialPlan.creditPrice || 50,
    monthlyPrice: initialPlan.monthlyPrice || initialPlan.creditPrice || 50,
    yearlyPrice: initialPlan.yearlyPrice || Math.round((initialPlan.monthlyPrice || initialPlan.creditPrice || 50) * 10),
    price: initialPlan.price || '50 Credits',
    order: initialPlan.order || 0,
    features: initialPlan.features || ['multi_app', 'user_data'],
    description: initialPlan.description || 'Production authentication infrastructure plan tier.',
    shortDescription: initialPlan.shortDescription || 'Essential platform scaling',
    icon: initialPlan.icon || 'Cpu',
    accentColor: initialPlan.accentColor || '#8B5CF6',
    badge: initialPlan.badge || 'Public',
    publicName: initialPlan.publicName || planName,
    internalId: initialPlan.internalId || planName.toLowerCase().replace(/\s+/g, '_'),
    maxVariables: initialPlan.maxVariables ?? 50,
    maxCloudVars: initialPlan.maxCloudVars ?? 20,
    maxWebhooks: initialPlan.maxWebhooks ?? 10,
    maxResellers: initialPlan.maxResellers ?? 5,
    maxDownloads: initialPlan.maxDownloads ?? -1,
    maxSessions: initialPlan.maxSessions ?? -1,
    maxApiRequests: initialPlan.maxApiRequests ?? -1,
    visibility: initialPlan.visibility || (initialPlan.onSale ? 'Public' : 'Hidden'),
    autoDowngrade: initialPlan.autoDowngrade ?? true,
    subscriptionRequired: initialPlan.subscriptionRequired ?? true,
    defaultPlan: initialPlan.defaultPlan ?? (planName === 'Free Plan'),
    recommendedPlan: initialPlan.recommendedPlan ?? (planName === 'Pro Plan'),
    highlightCard: initialPlan.highlightCard ?? (planName === 'Pro Plan')
  });

  const ALL_FEATURES = [
    { id: 'sandbox', label: 'Live API Testing (SDK Sandbox)', icon: <Terminal size={13} className="text-[#8B5CF6]" /> },
    { id: 'timeline', label: 'Activity Timeline (Audit Logs)', icon: <Activity size={13} className="text-[#8B5CF6]" /> },
    { id: 'cloud_vars', label: 'Cloud Variables', icon: <Database size={13} className="text-[#8B5CF6]" /> },
    { id: 'multi_app', label: 'Multiple Apps', icon: <Layers size={13} className="text-[#8B5CF6]" /> },
    { id: 'webhooks', label: 'Webhooks Support', icon: <Activity size={13} className="text-[#8B5CF6]" /> },
    { id: 'reseller', label: 'Reseller Portal', icon: <ShieldCheck size={13} className="text-[#8B5CF6]" /> },
    { id: 'user_data', label: 'Export Users', icon: <Code size={13} className="text-[#8B5CF6]" /> },
    { id: 'import_users', label: 'Import Users', icon: <Upload size={13} className="text-[#8B5CF6]" /> },
    { id: 'priority_support', label: 'Priority Support', icon: <Sparkles size={13} className="text-[#8B5CF6]" /> },
    { id: 'discord_sync', label: 'Discord Sync', icon: <Terminal size={13} className="text-[#8B5CF6]" /> },
    { id: 'hwid_lock', label: 'HWID Lock Enforcement', icon: <Lock size={13} className="text-[#8B5CF6]" /> },
    { id: 'version_check', label: 'Version Check Gate', icon: <Check size={13} className="text-[#8B5CF6]" /> },
    { id: 'file_delivery', label: 'File Delivery Engine', icon: <Box size={13} className="text-[#8B5CF6]" /> },
    { id: 'developer_logs', label: 'Developer Audit Logs', icon: <BarChart2 size={13} className="text-[#8B5CF6]" /> },
    { id: 'analytics', label: 'Usage Analytics', icon: <Activity size={13} className="text-[#8B5CF6]" /> },
    { id: 'license_management', label: 'License Management', icon: <Key size={13} className="text-[#8B5CF6]" /> },
    { id: 'user_notes', label: 'User Notes & Meta', icon: <Info size={13} className="text-[#8B5CF6]" /> },
    { id: 'dark_api', label: 'Dark API Endpoints', icon: <Zap size={13} className="text-[#8B5CF6]" /> }
  ];

  const COLOR_OPTIONS = ['#8B5CF6', '#22C55E', '#3B82F6', '#EC4899', '#F59E0B', '#6366F1', '#10B981', '#E11D48'];

  const toggleFeature = (fId: string) => {
    setDraft(prev => {
      const current = prev.features || [];
      const updated = current.includes(fId) ? current.filter(x => x !== fId) : [...current, fId];
      return { ...prev, features: updated };
    });
  };

  const calculateSavings = () => {
    const monthlyTotal = (draft.monthlyPrice || 0) * 12;
    const savings = monthlyTotal - (draft.yearlyPrice || 0);
    const percent = monthlyTotal > 0 ? Math.round((savings / monthlyTotal) * 100) : 0;
    return { savings: Math.max(0, savings), percent: Math.max(0, percent) };
  };

  const savings = calculateSavings();

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((draft.monthlyPrice || 0) < 0 || (draft.yearlyPrice || 0) < 0) {
      alert("Prices cannot be negative.");
      return;
    }
    setSaving(true);
    await onSave({
      ...draft,
      price: `${draft.monthlyPrice} Credits`,
      creditPrice: draft.monthlyPrice || 0,
      onSale: draft.visibility === 'Public' || draft.visibility === 'Beta'
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="bg-[#0c0d14] border border-white/10 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] glass-reflection">

        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                Configure {planName}
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                  {draft.visibility}
                </span>
              </h2>
              <p className="text-xs text-slate-400">Manage pricing, quota thresholds, dynamic features, and visibilities.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-4 border-b border-white/10 bg-white/[0.01] overflow-x-auto">
          {[
            { id: 'general', label: 'General' },
            { id: 'pricing', label: 'Pricing' },
            { id: 'limits', label: 'Limits' },
            { id: 'features', label: 'Features' },
            { id: 'visibility', label: 'Visibility' },
            { id: 'advanced', label: 'Advanced' }
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 rounded-t-xl ${activeTab === t.id
                  ? 'border-[#8B5CF6] text-[#8B5CF6] bg-[#8B5CF6]/10'
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body Content with Live Card Preview */}
        <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 custom-scrollbar">

          {/* Left / Middle Column: Active Tab Controls */}
          <div className="lg:col-span-2 space-y-6">

            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Plan Public Name</label>
                    <input
                      type="text"
                      value={draft.publicName}
                      onChange={e => setDraft({ ...draft, publicName: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 p-3.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Internal ID (Read Only)</label>
                    <input
                      type="text"
                      value={draft.internalId}
                      readOnly
                      className="w-full bg-white/[0.02] border border-white/5 p-3.5 rounded-xl text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Description</label>
                  <textarea
                    value={draft.description}
                    onChange={e => setDraft({ ...draft, description: e.target.value })}
                    rows={2}
                    className="w-full bg-white/[0.03] border border-white/10 p-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Badge Text</label>
                    <input
                      type="text"
                      value={draft.badge}
                      onChange={e => setDraft({ ...draft, badge: e.target.value })}
                      placeholder="e.g. Popular, Recommended, Enterprise"
                      className="w-full bg-white/[0.03] border border-white/10 p-3.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Display Order</label>
                    <input
                      type="number"
                      value={draft.order}
                      onChange={e => setDraft({ ...draft, order: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.03] border border-white/10 p-3.5 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
                    />
                  </div>
                </div>

                {/* Accent Color Palette */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Accent Color</label>
                  <div className="flex items-center gap-3">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setDraft({ ...draft, accentColor: c })}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${draft.accentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Monthly Credits</label>
                    <input
                      type="number"
                      value={draft.monthlyPrice}
                      onChange={e => setDraft({ ...draft, monthlyPrice: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-lg font-black font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Yearly Credits</label>
                    <input
                      type="number"
                      value={draft.yearlyPrice}
                      onChange={e => setDraft({ ...draft, yearlyPrice: parseInt(e.target.value) || 0 })}
                      className="w-full bg-white/[0.03] border border-white/10 p-4 rounded-xl text-lg font-black font-mono text-white focus:outline-none focus:border-[#8B5CF6]"
                      required
                    />
                  </div>
                </div>

                {/* Live Savings Auto Calculator Box */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                    <span>Yearly Savings Calculation</span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30">
                      Save {savings.percent}%
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center pt-2">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] font-bold uppercase text-slate-400">12x Monthly{savings.percent > 0 ? null : null}</div>
                      <div className="text-sm font-black font-mono text-white">{(draft.monthlyPrice || 0) * 12} PTS</div>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                      <div className="text-[9px] font-bold uppercase text-slate-400">1x Yearly</div>
                      <div className="text-sm font-black font-mono text-white">{draft.yearlyPrice} PTS</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="text-[9px] font-bold uppercase text-emerald-400">Customer Saves</div>
                      <div className="text-sm font-black font-mono text-emerald-300">{savings.savings} PTS</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LIMITS TAB */}
            {activeTab === 'limits' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-400 mb-2">Set numerical quota boundaries. Use <code className="text-purple-400">-1</code> to grant unlimited capacity.</div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { key: 'maxApps', label: 'Max Apps' },
                    { key: 'maxUsers', label: 'Max Users' },
                    { key: 'maxVariables', label: 'Max App Vars' },
                    { key: 'maxCloudVars', label: 'Max Cloud Vars' },
                    { key: 'maxWebhooks', label: 'Max Webhooks' },
                    { key: 'maxResellers', label: 'Max Resellers' }
                  ].map(l => (
                    <div key={l.key} className="space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">{l.label}</label>
                        <button
                          type="button"
                          onClick={() => setDraft({ ...draft, [l.key]: draft[l.key as keyof SystemPlan] === -1 ? 10 : -1 })}
                          className="text-[9px] font-black text-[#8B5CF6] hover:underline"
                        >
                          {draft[l.key as keyof SystemPlan] === -1 ? 'Set Limit' : '∞ Unlimited'}
                        </button>
                      </div>
                      <input
                        type="number"
                        value={draft[l.key as keyof SystemPlan] as number}
                        onChange={e => setDraft({ ...draft, [l.key]: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/[0.03] border border-white/10 p-2.5 rounded-lg text-sm font-mono font-bold text-white focus:outline-none focus:border-[#8B5CF6]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FEATURES TAB */}
            {activeTab === 'features' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-3">Toggle modular infrastructure capability gates for this plan tier.</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ALL_FEATURES.map(f => {
                    const isEnabled = draft.features?.includes(f.id);
                    return (
                      <button
                        type="button"
                        key={f.id}
                        onClick={() => toggleFeature(f.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between text-left transition-all ${isEnabled
                            ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/40 text-white shadow-md'
                            : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {f.icon}
                          <span className="text-xs font-bold">{f.label}</span>
                        </div>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${isEnabled ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white' : 'border-white/20'}`}>
                          {isEnabled && <Check size={12} />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VISIBILITY TAB */}
            {activeTab === 'visibility' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-400 mb-3">Control catalog visibility and public availability.</div>
                <div className="grid grid-cols-2 gap-3">
                  {['Public', 'Hidden', 'Beta', 'Coming Soon', 'Deprecated', 'Archived'].map(vis => (
                    <button
                      type="button"
                      key={vis}
                      onClick={() => setDraft({ ...draft, visibility: vis as PlanVisibility, onSale: vis === 'Public' || vis === 'Beta' })}
                      className={`p-4 rounded-2xl border text-left transition-all ${draft.visibility === vis
                          ? 'bg-[#8B5CF6]/15 border-[#8B5CF6] text-white shadow-lg'
                          : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white'
                        }`}
                    >
                      <div className="text-sm font-bold">{vis}</div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        {vis === 'Public' && 'Visible in customer catalog.'}
                        {vis === 'Hidden' && 'Hidden from shop, assigned via admin only.'}
                        {vis === 'Beta' && 'Experimental tier for testing.'}
                        {vis === 'Archived' && 'Legacy tier retained for history.'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ADVANCED TAB */}
            {activeTab === 'advanced' && (
              <div className="space-y-3">
                {[
                  { key: 'autoDowngrade', label: 'Auto Downgrade on Expiry', desc: 'Automatically return customer to Free Plan when subscription duration completes.' },
                  { key: 'subscriptionRequired', label: 'Subscription Duration Lock', desc: 'Enforce automatic recurring renewal countdowns.' },
                  { key: 'recommendedPlan', label: 'Recommended Plan Badge', desc: 'Highlight this tier as the recommended infrastructure upgrade.' },
                  { key: 'highlightCard', label: 'Neon Glow Card Highlight', desc: 'Apply ambient purple neon glow borders to card in catalog.' }
                ].map(adv => (
                  <label key={adv.key} className="flex items-start gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-2xl cursor-pointer hover:border-white/10 transition-all">
                    <input
                      type="checkbox"
                      checked={!!draft[adv.key as keyof SystemPlan]}
                      onChange={e => setDraft({ ...draft, [adv.key]: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-[#8B5CF6] focus:ring-0"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{adv.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{adv.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}

          </div>

          {/* Right Column: Real-Time Live Card Preview */}
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Eye size={14} className="text-[#8B5CF6]" /> Real-Time Live Preview
            </div>

            <div className="p-6 rounded-[24px] bg-[rgba(18,20,28,0.9)] border border-white/10 relative overflow-hidden backdrop-blur-xl shadow-2xl glass-reflection">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{draft.publicName || planName}</h3>
                  <span className="text-[10px] font-bold text-[#8B5CF6] uppercase">{draft.badge || 'Infrastructure'}</span>
                </div>
                <span className="text-[9px] font-bold uppercase px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
                  {draft.visibility}
                </span>
              </div>

              <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="text-[9px] font-bold text-slate-400 uppercase">Monthly Price</div>
                <div className="text-2xl font-black text-white font-mono">{draft.monthlyPrice} <span className="text-xs font-bold text-[#8B5CF6]">PTS</span></div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center text-xs mb-4">
                <div className="p-2 bg-white/5 rounded-lg">Apps: {draft.maxApps === -1 ? '∞' : draft.maxApps}</div>
                <div className="p-2 bg-white/5 rounded-lg">Users: {draft.maxUsers === -1 ? '∞' : draft.maxUsers}</div>
              </div>

              <div className="flex flex-wrap gap-1">
                {draft.features?.map(f => (
                  <span key={f} className="text-[9px] px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {f}
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all bg-white text-black hover:bg-slate-200 shadow-xl flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              <span>Save & Publish Changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Record<string, Customer>>({});
  const [plans, setPlans] = useState<Record<string, SystemPlan>>({});
  const [allApps, setAllApps] = useState<{ name: string; secret: string; owner: string }[]>([]);
  const [appCount, setAppCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'system' | 'credit_packages' | 'payment_config' | 'credit_requests'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [maintenance, setMaintenance] = useState<SystemConfig>({ maintenanceMode: false, maintenanceMessage: '' });

  const [showEditUserPlan, setShowEditUserPlan] = useState<string | null>(null);
  const [showGiveCredits, setShowGiveCredits] = useState<string | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showEditPlan, setShowEditPlan] = useState<string | null>(null);

  const [creditPackages, setCreditPackages] = useState<Record<string, CreditPackage>>({});
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    upiId: 'notexe@upi',
    qrImageUrl: '',
    discordUrl: 'https://discord.gg/HrVXH3wNpj',
    instagramUrl: 'https://instagram.com/'
  });
  const [creditRequests, setCreditRequests] = useState<Record<string, CreditTopUpRequest>>({});
  const [showQrLightbox, setShowQrLightbox] = useState<string | null>(null);
  const [showEditPackageModal, setShowEditPackageModal] = useState<CreditPackage | null>(null);
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [planFilter, setPlanFilter] = useState<'all' | 'public' | 'hidden' | 'beta' | 'archived'>('all');
  const [planSearchTerm, setPlanSearchTerm] = useState<string>('');
  const [editPlanTab, setEditPlanTab] = useState<'general' | 'pricing' | 'limits' | 'features' | 'visibility' | 'advanced'>('general');

  useEffect(() => {
    commandPaletteService.updateContextData({
      userRole: 'admin',
      actions: {
        switchTab: (tab: string) => setActiveTab(tab as any),
        toggleMaintenance: async () => {
          await set(ref(db, 'system/config/maintenanceMode'), !maintenance?.maintenanceMode);
        }
      }
    });
  }, [maintenance]);

  const logPlanAction = async (planName: string, action: 'create' | 'update' | 'delete' | 'duplicate' | 'reorder', details: string) => {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const logEntry: PlanAuditLog = {
        id: logId,
        planName,
        action,
        performedBy: auth.currentUser?.email || 'admin',
        timestamp: new Date().toISOString(),
        changesSummary: details
      };
      await set(ref(db, `system/planAuditLogs/${logId}`), encrypt(logEntry));
    } catch (e) {
      console.warn("Audit log write error:", e);
    }
  };

  const duplicatePlan = async (sourceName: string, sourcePlan: SystemPlan) => {
    const newName = `${sourceName} Copy`;
    if (plans[newName]) {
      addToast(`Plan "${newName}" already exists.`, 'error');
      return;
    }
    const clonedPlan: SystemPlan = {
      ...sourcePlan,
      order: Object.keys(plans).length + 1,
      publicName: `${sourcePlan.publicName || sourceName} Copy`,
      internalId: newName.toLowerCase().replace(/\s+/g, '_')
    };
    await set(ref(db, `system/plans/${newName}`), encrypt(clonedPlan));
    await logPlanAction(newName, 'duplicate', `Duplicated from ${sourceName}`);
    addToast(`Duplicated ${sourceName} as ${newName}`);
  };

  const exportPlansJSON = () => {
    const jsonStr = JSON.stringify(plans, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notexe_plans_catalog_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported plan catalog to JSON');
  };

  const importPlansJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const importedData = JSON.parse(evt.target?.result as string);
        if (typeof importedData !== 'object' || importedData === null) {
          throw new Error('Invalid JSON format');
        }
        const seedPayload: Record<string, string> = {};
        Object.keys(importedData).forEach(pName => {
          seedPayload[pName] = encrypt(importedData[pName]);
        });
        await set(ref(db, `system/plans`), seedPayload);
        addToast('Successfully imported plan catalog from JSON');
        await logPlanAction('ALL', 'update', 'Imported plan catalog from JSON file');
      } catch (err) {
        addToast('Failed to import JSON: Invalid plan catalog file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const [sdksList, setSdksList] = useState<SDK[]>([]);
  const [showSdkModal, setShowSdkModal] = useState(false);
  const [editingSdk, setEditingSdk] = useState<SDK | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean, title: string, message: string, onConfirm: () => void, danger?: boolean
  }>({ show: false, title: '', message: '', onConfirm: () => { } });

  const [toasts, setToasts] = useState<{ id: string; msg: string; type: 'info' | 'error' }[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const addToast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, msg, type: type === 'success' ? 'info' : 'error' }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  useEffect(() => {
    if (auth.currentUser?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      navigate('/dashboard');
      return;
    }

    const unsubSdks = subscribeToSDKs((loaded) => setSdksList(loaded));

    const loadingTimer = setTimeout(() => setLoading(false), 5000);

    onValue(ref(db, 'customers'), (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, Customer> = {};
      Object.keys(raw).forEach(k => {
        const result = decrypt(raw[k]);
        if (result && typeof result === 'object') {
          const derivedEmail = (result.email && result.email.includes('@'))
            ? result.email
            : k.replace(/,/g, '.');
          const derivedSecret = result.secret || `NXE-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          const derivedPlan = result.plan || 'Free Plan';
          const derivedCreatedAt = result.createdAt || new Date().toISOString();

          dec[k] = {
            ...result,
            email: derivedEmail,
            secret: derivedSecret,
            plan: derivedPlan,
            credits: typeof result.credits === 'number' ? result.credits : 0,
            createdAt: derivedCreatedAt
          };
        }
      });
      setCustomers(dec);
      clearTimeout(loadingTimer);
      setLoading(false);
    });

    onValue(ref(db, 'system/plans'), (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, SystemPlan> = {};
      Object.keys(raw).forEach(k => dec[k] = decrypt(raw[k]));

      if (!dec['Free Plan']) {
        const free = { maxApps: 1, maxUsers: 50, onSale: true, creditPrice: 0, price: 'Free', order: 0 };
        set(ref(db, 'system/plans/Free Plan'), encrypt(free));
        dec['Free Plan'] = free;
      }

      setPlans(dec);
    });

    onValue(ref(db, 'system/creditPackages'), (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, CreditPackage> = {};
      Object.keys(raw).forEach(k => {
        const p = decrypt(raw[k]);
        if (p && typeof p === 'object') dec[k] = p;
      });

      if (Object.keys(dec).length === 0) {
        DEFAULT_CREDIT_PACKAGES.forEach(pkg => {
          set(ref(db, `system/creditPackages/${pkg.id}`), encrypt(pkg));
          dec[pkg.id] = pkg as CreditPackage;
        });
      }

      setCreditPackages(dec);
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

    onValue(ref(db, 'system/creditRequests'), (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, CreditTopUpRequest> = {};
      Object.keys(raw).forEach(k => {
        const r = decrypt(raw[k]);
        if (r && typeof r === 'object') dec[k] = r;
      });
      setCreditRequests(dec);
    });

    onValue(ref(db, 'system/config'), (snap) => {
      setMaintenance(snap.val() || { maintenanceMode: false, maintenanceMessage: '' });
    });

    onValue(ref(db, 'applications'), (snap) => {
      let count = 0;
      const data = snap.val() || {};
      Object.values(data).forEach((userApps: any) => {
        count += Object.keys(userApps).length;
      });
      setAppCount(count);
      const appsList: { name: string; secret: string; owner: string }[] = [];
      Object.keys(data).forEach(secret => {
        Object.keys(data[secret]).forEach(appName => {
          const owner = (Object.values(customers) as Customer[]).find(c => c.secret === secret)?.email || 'Unknown';
          appsList.push({ name: appName, secret, owner });
        });
      });
      setAllApps(appsList);

      let userCount = 0;
      Object.keys(data).forEach(secret => {
        Object.values(data[secret]).forEach((app: any) => {
          if (app.users) {
            userCount += Object.keys(app.users).length;
          }
        });
      });
      set(ref(db, 'system/stats'), {
        totalUsers: userCount,
        totalApps: count,
        lastUpdated: Date.now()
      });
    });

    return () => clearTimeout(loadingTimer);
  }, []);

  const filteredCustomers = (Object.entries(customers) as [string, Customer][]).filter(([key, cust]) =>
    (cust?.email?.toLowerCase() ?? '').includes(searchTerm.toLowerCase()) ||
    (cust?.secret?.toLowerCase() ?? '').includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[#06080d] text-white relative overflow-hidden">

      {/* MOBILE TOP HEADER BAR */}
      <header className="md:hidden h-16 bg-[#0b0d14] border-b border-white/[0.08] px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-xl border border-white/10">
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2">
            <Crown size={18} className="text-amber-400" />
            <span className="font-bold text-sm text-white">Admin Console</span>
          </div>
        </div>
        <Link to="/dashboard" className="p-2 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center gap-1.5">
          <ArrowLeft size={14} /> Exit
        </Link>
      </header>

      {/* MOBILE BACKDROP */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR NAVIGATION (RESPONSIVE DRAWER) */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#0b0d14] backdrop-blur-xl border-r border-white/[0.08] p-6 flex flex-col gap-6 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-black flex items-center justify-center font-black text-xs shadow-lg shadow-amber-500/20">
              <Crown size={18} />
            </div>
            <div>
              <div className="font-bold text-sm text-white tracking-tight">Admin Console</div>
              <div className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Super Control</div>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1.5 text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 space-y-1.5">
          <button onClick={() => { setActiveTab('users'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'users' ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <Users size={16} className={activeTab === 'users' ? 'text-indigo-400' : 'text-slate-400'} /> Customers
          </button>
          <button onClick={() => { setActiveTab('plans'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'plans' ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <BarChart2 size={16} className={activeTab === 'plans' ? 'text-indigo-400' : 'text-slate-400'} /> System Plans
          </button>
          <button onClick={() => { setActiveTab('credit_packages'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'credit_packages' ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <Coins size={16} className={activeTab === 'credit_packages' ? 'text-indigo-400' : 'text-slate-400'} /> Credit Pricing
          </button>
          <button onClick={() => { setActiveTab('payment_config'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'payment_config' ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <QrCode size={16} className={activeTab === 'payment_config' ? 'text-indigo-400' : 'text-slate-400'} /> Payment & QR Config
          </button>
          <button onClick={() => { setActiveTab('credit_requests'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'credit_requests' ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <Upload size={16} className={activeTab === 'credit_requests' ? 'text-indigo-400' : 'text-slate-400'} /> Payment Proofs
          </button>
          <button onClick={() => { setActiveTab('system'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all ${activeTab === 'system' ? 'bg-gradient-to-r from-indigo-500/15 to-violet-500/10 text-white border-l-2 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'}`}>
            <Hammer size={16} className={activeTab === 'system' ? 'text-indigo-400' : 'text-slate-400'} /> System Config
          </button>
        </nav>
        <Link to="/dashboard" className="mt-auto flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all">
          <ArrowLeft size={16} /> Back to App
        </Link>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in custom-scrollbar">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Management Console</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card glass-card-hover p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Total Customers</div>
            <div className="text-3xl font-black text-white">{Object.keys(customers).length}</div>
          </div>
          <div className="glass-card glass-card-hover p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Total Applications</div>
            <div className="text-3xl font-black text-indigo-400">{appCount}</div>
          </div>
          <div className="glass-card glass-card-hover p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">Active System Plans</div>
            <div className="text-3xl font-black text-amber-400">{Object.keys(plans).length}</div>
          </div>
        </div>

        {activeTab === 'users' ? (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="relative w-full sm:w-80 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-white transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search by email or secret..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#080a10] border border-white/[0.08] rounded-xl py-2.5 pl-10 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500/60 transition-all placeholder:text-slate-500 shadow-inner"
                />
              </div>
              <button
                onClick={() => setShowGiveCredits('')}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <Coins size={15} /> Add Credits
              </button>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden shadow-2xl bg-white/[0.02] border border-white/[0.05] overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs text-white min-w-[650px]">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {(filteredCustomers as [string, Customer][]).map(([key, c]) => (
                    <tr key={key} className="group hover:bg-white/[0.03] transition-colors">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-white group-hover:text-indigo-400 transition-colors">{c.email}</span>
                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tight mt-0.5">{c.secret}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                          {c.plan}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-amber-400">
                          <Coins size={14} />
                          <span>{c.credits}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-400 font-medium">
                        {new Date(c.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setShowEditUserPlan(key)}
                            className="p-2 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all border border-white/5"
                            title="Edit Plan"
                          >
                            <Crown size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await adminExtendSubscription(c.email, 30);
                                addToast(`Extended ${c.email} subscription by 30 days`);
                              } catch (e) {
                                addToast('Extend failed', 'error');
                              }
                            }}
                            className="p-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500 hover:text-white rounded-lg transition-all border border-purple-500/20"
                            title="Extend 30 Days"
                          >
                            <Clock size={15} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                if (c.subscription?.status === 'suspended') {
                                  await adminRestoreSubscription(c.email);
                                  addToast(`Restored ${c.email} subscription access`);
                                } else {
                                  await adminSuspendSubscription(c.email);
                                  addToast(`Suspended ${c.email} subscription access`, 'error');
                                }
                              } catch (e) {
                                addToast('Action failed', 'error');
                              }
                            }}
                            className="p-2 bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white rounded-lg transition-all border border-amber-500/20"
                            title={c.subscription?.status === 'suspended' ? 'Restore Access' : 'Suspend Access'}
                          >
                            <Lock size={15} />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                show: true,
                                title: 'Delete Customer',
                                message: `Are you sure you want to delete ${c.email}? This will also delete ALL their applications and data.`,
                                danger: true,
                                onConfirm: async () => {
                                  await remove(ref(db, `customers/${key}`));
                                  await remove(ref(db, `applications/${c.secret}`));
                                  setConfirmModal(prev => ({ ...prev, show: false }));
                                  addToast('Customer deleted');
                                }
                              });
                            }}
                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-all border border-rose-500/20"
                            title="Delete User"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-500 uppercase tracking-wider text-xs font-bold">
                        No customers found matching your search
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'plans' ? (
          <div className="space-y-6">
            {/* Search, Filter & Catalog Backup Toolbar */}
            <div className="glass-card-premium border border-white/10 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={planSearchTerm}
                    onChange={(e) => setPlanSearchTerm(e.target.value)}
                    placeholder="Search plans by name, features, or ID..."
                    className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-purple-400 shrink-0" />
                  <select
                    value={planFilter}
                    onChange={(e) => setPlanFilter(e.target.value as any)}
                    className="bg-white/[0.04] border border-white/10 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
                  >
                    <option value="all" className="bg-slate-900">All Tiers</option>
                    <option value="public" className="bg-slate-900">Public Tiers</option>
                    <option value="hidden" className="bg-slate-900">Hidden Tiers</option>
                    <option value="beta" className="bg-slate-900">Beta Tiers</option>
                    <option value="archived" className="bg-slate-900">Archived Tiers</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                <button
                  onClick={exportPlansJSON}
                  className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                  title="Export Plan Catalog as JSON"
                >
                  <FileJson size={14} className="text-purple-400" /> Export JSON
                </button>
                <label className="px-3.5 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer">
                  <Upload size={14} className="text-purple-400" /> Import JSON
                  <input type="file" accept=".json" onChange={importPlansJSON} className="hidden" />
                </label>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.entries(plans) as [string, SystemPlan][])
                .filter(([name, plan]) => {
                  const queryMatch = name.toLowerCase().includes(planSearchTerm.toLowerCase()) ||
                    (plan.publicName && plan.publicName.toLowerCase().includes(planSearchTerm.toLowerCase())) ||
                    (plan.features && plan.features.some(f => f.toLowerCase().includes(planSearchTerm.toLowerCase())));

                  if (!queryMatch) return false;
                  if (planFilter === 'public') return plan.onSale && (!plan.visibility || plan.visibility === 'Public');
                  if (planFilter === 'hidden') return !plan.onSale || plan.visibility === 'Hidden';
                  if (planFilter === 'beta') return plan.visibility === 'Beta';
                  if (planFilter === 'archived') return plan.visibility === 'Archived';
                  return true;
                })
                .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
                .map(([name, plan], index, allPlans) => (
                  <div
                    key={name}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('planName', name);
                      e.dataTransfer.setData('planIndex', index.toString());
                    }}
                    onDrop={async (e) => {
                      e.preventDefault();
                      const draggedName = e.dataTransfer.getData('planName');
                      const draggedIndex = parseInt(e.dataTransfer.getData('planIndex'));
                      if (draggedName === name) return;

                      const newOrder = [...allPlans];
                      const [draggedItem] = newOrder.splice(draggedIndex, 1);
                      newOrder.splice(index, 0, draggedItem);

                      const { update } = await import('firebase/database');
                      const updates: Record<string, string> = {};
                      newOrder.forEach(([pName, pData], i) => {
                        updates[`system/plans/${pName}`] = encrypt({ ...pData, order: i });
                      });

                      await update(ref(db), updates);
                      addToast('Plan order updated');
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-purple-500/40', 'bg-purple-500/[0.03]');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-purple-500/40', 'bg-purple-500/[0.03]');
                    }}
                    onDropCapture={(e) => {
                      e.currentTarget.classList.remove('border-purple-500/40', 'bg-purple-500/[0.03]');
                    }}
                    className="relative group glass-card-premium border border-white/10 p-8 rounded-[2.5rem] shadow-2xl hover:border-purple-500/40 transition-all duration-300 flex flex-col h-full cursor-move glass-reflection"
                  >
                    {/* Top: Drag Handle, Plan Name & Visibility Badge */}
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white/[0.04] text-slate-500 group-hover:text-purple-400 transition-colors">
                          <GripVertical size={18} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-black tracking-tight text-white mb-0.5">{name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-3 py-0.5 rounded-full border uppercase tracking-widest ${plan.onSale ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-slate-800/40 text-slate-400 border-white/10'}`}>
                              {plan.onSale ? 'Public Tier' : 'Private Tier'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Credit Price Highlight & Quota Stats */}
                    <div className="space-y-3 mb-8 flex-1">
                      {/* Credit Price Focus Header */}
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex justify-between items-center shadow-inner">
                        <span className="text-xs font-bold text-amber-400/90 uppercase tracking-widest">Credit Price</span>
                        <div className="text-2xl font-black text-white flex items-baseline gap-1">
                          <span className="text-amber-300">{plan.creditPrice}</span>
                          <span className="text-[10px] font-bold text-amber-400/70 uppercase">Credits</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Max Apps</span>
                          <span className="font-black text-lg text-white">{plan.maxApps === -1 ? 'Unlimited' : plan.maxApps}</span>
                        </div>
                        <div className="bg-white/[0.02] p-3.5 rounded-2xl border border-white/5 flex flex-col justify-center items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Max Users</span>
                          <span className="font-black text-lg text-white">{plan.maxUsers === -1 ? 'Unlimited' : plan.maxUsers}</span>
                        </div>
                      </div>

                      {/* Features Preview Pills */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="pt-2 flex flex-wrap gap-1.5">
                          {plan.features.map(f => (
                            <span key={f} className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 text-slate-300">
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Bottom: Re-order Controls & Action Buttons */}
                    <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <button
                          disabled={index === 0}
                          onClick={async () => {
                            const prev = allPlans[index - 1];
                            const currOrder = plan.order;
                            const prevOrder = prev[1].order;
                            await set(ref(db, `system/plans/${name}`), encrypt({ ...plan, order: prevOrder }));
                            await set(ref(db, `system/plans/${prev[0]}`), encrypt({ ...prev[1], order: currOrder }));
                          }}
                          className="flex-1 py-2.5 btn-magnetic-glass effect-magnetic text-[10px] font-extrabold uppercase tracking-widest disabled:opacity-20 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ArrowUp size={14} /> Move Up
                        </button>
                        <button
                          disabled={index === allPlans.length - 1}
                          onClick={async () => {
                            const next = allPlans[index + 1];
                            const currOrder = plan.order;
                            const nextOrder = next[1].order;
                            await set(ref(db, `system/plans/${name}`), encrypt({ ...plan, order: nextOrder }));
                            await set(ref(db, `system/plans/${next[0]}`), encrypt({ ...next[1], order: currOrder }));
                          }}
                          className="flex-1 py-2.5 btn-magnetic-glass effect-magnetic text-[10px] font-extrabold uppercase tracking-widest disabled:opacity-20 flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <ArrowDown size={14} /> Move Down
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowEditPlan(name)}
                          className="flex-1 py-3.5 btn-magnetic-primary effect-magnetic text-[10px] font-extrabold uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
                        >
                          Configure
                        </button>
                        <button
                          onClick={() => {
                            if (name === 'Free Plan') return addToast('Free Plan cannot be deleted', 'error');
                            setConfirmModal({
                              show: true,
                              title: 'Delete Plan',
                              message: `Permanently delete the ${name}? Customers currently on this plan will stay on it but it won't be assignable anymore.`,
                              danger: true,
                              onConfirm: async () => {
                                await remove(ref(db, `system/plans/${name}`));
                                setConfirmModal(prev => ({ ...prev, show: false }));
                                addToast('Plan deleted');
                              }
                            });
                          }}
                          className="px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/30 rounded-2xl transition-all duration-200 effect-repulsive shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

              {/* Create Infrastructure Plan Card */}
              <button
                onClick={() => setShowCreatePlan(true)}
                className="group border-2 border-dashed border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 bg-[rgba(16,18,24,0.65)] hover:bg-[#8B5CF6]/05 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-slate-400 hover:text-white transition-all duration-300 cursor-pointer glass-reflection shadow-xl min-h-[360px] backdrop-blur-xl"
              >
                <div className="w-16 h-16 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-3xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-[#8B5CF6]/20 transition-all shadow-[0_0_25px_rgba(139,92,246,0.2)]">
                  <Plus size={30} className="text-[#8B5CF6] group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <span className="font-extrabold uppercase tracking-[0.2em] text-[11px] text-[#8B5CF6]">Create Infrastructure Plan</span>
                <span className="text-[10px] font-medium text-slate-400 mt-1">Dynamic limits, pricing and feature gates.</span>
              </button>
            </div>
          </div>
        ) : activeTab === 'system' ? (
          <div className="max-w-xl space-y-8 animate-fade-in">
            <div className="glass-card-premium border border-white/10 p-10 rounded-[2.5rem] shadow-2xl glass-reflection">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <Hammer className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Maintenance Control</h3>
                  <p className="text-muted text-[10px] uppercase font-bold tracking-widest mt-1">Global System Toggle</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                  <div className="space-y-1">
                    <div className="font-black text-sm uppercase tracking-widest">Maintenance Mode</div>
                    <div className="text-muted text-[10px] uppercase font-bold">Block non-admin access</div>
                  </div>
                  <button
                    onClick={async () => {
                      const isCurrentlyOn = maintenance?.maintenanceMode === true || (maintenance?.maintenanceMode as any) === 'true';
                      const newState = !isCurrentlyOn;
                      await set(ref(db, 'system/config/maintenanceMode'), newState);
                      addToast(`Maintenance mode ${newState ? 'ENABLED' : 'DISABLED'}`);
                    }}
                    className={`w-14 h-8 rounded-full transition-all relative ${(maintenance?.maintenanceMode === true || (maintenance?.maintenanceMode as any) === 'true') ? 'bg-danger shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${(maintenance?.maintenanceMode === true || (maintenance?.maintenanceMode as any) === 'true') ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-4 bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-widest uppercase text-muted/50 ml-2">Sub-Status Text</label>
                    <input
                      placeholder="e.g. Polishing Gears"
                      value={maintenance?.maintenanceStatus || ''}
                      onChange={(e) => setMaintenance(prev => ({ ...prev, maintenanceStatus: e.target.value }))}
                      className="w-full bg-[#080a10] border border-white/10 p-4 rounded-2xl focus:outline-none focus:border-white/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1 mt-4">
                    <label className="text-[10px] font-black tracking-widest uppercase text-muted/50 ml-2">Custom Message</label>
                    <textarea
                      placeholder="We're currently performing some improvements..."
                      value={maintenance?.maintenanceMessage || ''}
                      onChange={(e) => setMaintenance(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                      className="w-full bg-[#080a10] border border-white/10 p-6 rounded-3xl focus:outline-none focus:border-white/20 text-sm leading-relaxed"
                      rows={3}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      const { update } = await import('firebase/database');
                      await update(ref(db, 'system/config'), {
                        maintenanceMessage: maintenance.maintenanceMessage || '',
                        maintenanceStatus: maintenance.maintenanceStatus || ''
                      });
                      addToast('Maintenance info updated');
                    }}
                    className="w-full py-4 btn-magnetic-primary text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl transition-all"
                  >
                    Update All Info
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-card-premium border border-white/10 p-10 rounded-[2.5rem] shadow-2xl glass-reflection">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-white/10 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
                    <Code size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white">SDK Management Console</h3>
                    <p className="text-slate-400 text-xs font-medium mt-0.5">Database-driven SDK system with Monaco Code Editor & Live Sync</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSdk(null);
                    setShowSdkModal(true);
                  }}
                  className="btn-magnetic-primary px-5 py-3 text-xs font-bold flex items-center gap-2 shrink-0"
                >
                  <Plus size={16} />
                  <span>Register New SDK</span>
                </button>
              </div>

              <div className="space-y-4">
                {sdksList.map((sdk) => (
                  <div
                    key={sdk.id}
                    className="bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl border border-white/10 p-5 md:p-6 transition-all duration-300 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden group"
                  >
                    {/* Left: SDK Info */}
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-black text-xs text-indigo-400 shrink-0 mt-0.5 shadow-sm">
                        #{sdk.displayOrder || 1}
                      </div>
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-extrabold text-sm md:text-base text-white tracking-tight">{sdk.name}</h4>
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {sdk.language}
                          </span>
                          {sdk.version && (
                            <span className="text-[10px] font-mono text-slate-300 px-2.5 py-0.5 rounded-md bg-white/10 border border-white/5 font-bold">
                              {sdk.version}
                            </span>
                          )}
                          {sdk.badge && (
                            <span className="text-[9px] font-black px-2.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                              {sdk.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 font-medium leading-relaxed break-words max-w-2xl">
                          {sdk.description || 'Official client library for Not Exe.'}
                        </p>

                        {sdk.githubUrl && (
                          <a
                            href={sdk.githubUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-400 hover:text-indigo-300 transition-colors max-w-full"
                          >
                            <Github size={13} className="shrink-0" />
                            <span className="truncate">{sdk.githubUrl}</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right / Bottom: Action Controls (Self-Contained inside card) */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5 shrink-0 justify-start lg:justify-end">
                      {/* Visibility Toggle Button */}
                      <button
                        type="button"
                        onClick={async () => {
                          await toggleSDKVisibility(sdk.id, sdk.visible);
                          addToast(`SDK ${sdk.name} is now ${!sdk.visible ? 'Visible' : 'Hidden'}`);
                        }}
                        className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all border shrink-0 ${sdk.visible
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 shadow-sm'
                            : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 shadow-sm'
                          }`}
                      >
                        {sdk.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{sdk.visible ? 'Visible' : 'Hidden'}</span>
                      </button>

                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSdk(sdk);
                          setShowSdkModal(true);
                        }}
                        className="h-9 px-3.5 rounded-xl text-xs font-bold text-slate-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-1.5 shrink-0"
                        title="Edit SDK & Code"
                      >
                        <Edit2 size={14} />
                        <span>Edit</span>
                      </button>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            show: true,
                            title: 'Delete SDK',
                            message: `Are you sure you want to delete ${sdk.name}? It will instantly be removed from the Landing Page and Documentation.`,
                            danger: true,
                            onConfirm: async () => {
                              await deleteSDK(sdk.id);
                              setConfirmModal(prev => ({ ...prev, show: false }));
                              addToast(`SDK ${sdk.name} deleted`);
                            }
                          });
                        }}
                        className="h-9 px-3.5 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1.5 shrink-0"
                        title="Delete SDK"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {sdksList.length === 0 && (
                  <div className="text-center py-10 text-slate-500 text-xs font-bold uppercase tracking-widest opacity-50">
                    No SDKs currently registered in database.
                  </div>
                )}
              </div>
            </div>



            <div className="bg-danger/5 border border-danger/20 p-8 rounded-[2rem] flex items-start gap-4">
              <AlertTriangle className="text-danger mt-1" size={20} />
              <div className="space-y-1">
                <div className="text-danger font-black text-xs uppercase tracking-widest">Administrator Bypass</div>
                <p className="text-danger/60 text-[10px] leading-relaxed uppercase font-bold">
                  Maintenance mode does not affect your account. You will always have access to the Dashboard and Management Console.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === 'credit_packages' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Credit Packages & INR Pricing Catalog</h2>
                <p className="text-xs text-slate-400">Configure prices (₹ INR), credit amounts (PTS), badges, and recommendations for all pre-made and custom credit cards.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    DEFAULT_CREDIT_PACKAGES.forEach(async (pkg) => {
                      await set(ref(db, `system/creditPackages/${pkg.id}`), encrypt(pkg));
                    });
                    addToast('Restored all pre-made credit packages to defaults');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-amber-400" /> Reset to Defaults
                </button>

                <button
                  onClick={() => {
                    const newId = `pkg_${Date.now()}`;
                    const newPkg: CreditPackage = {
                      id: newId,
                      name: 'Custom Credit Package',
                      credits: 100,
                      priceINR: 999,
                      popular: false,
                      recommendedFor: 'Custom Tier',
                      badge: 'Standard',
                      order: Object.keys(creditPackages).length + 1
                    };
                    set(ref(db, `system/creditPackages/${newId}`), encrypt(newPkg));
                    addToast('Created new credit package');
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs uppercase font-bold tracking-wider flex items-center gap-2 transition-all shadow-lg"
                >
                  <Plus size={15} /> Add Custom Package
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(
                Object.keys(creditPackages).length > 0
                  ? creditPackages
                  : DEFAULT_CREDIT_PACKAGES.reduce((acc, p) => ({ ...acc, [p.id]: p as CreditPackage }), {} as Record<string, CreditPackage>)
              )
                .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
                .map(([pkgId, pkg]) => (
                  <div key={pkgId} className={`glass-card p-6 rounded-3xl border transition-all space-y-4 relative ${pkg.popular ? 'bg-gradient-to-b from-indigo-500/10 via-white/[0.03] to-white/[0.02] border-indigo-500/50 shadow-xl' : 'bg-white/[0.03] border-white/10'
                    }`}>
                    {pkg.popular && (
                      <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-full shadow-md tracking-wider">
                        Popular Choice
                      </div>
                    )}

                    <div className="flex justify-between items-start pt-1">
                      <div className="flex-1 mr-2">
                        <input
                          type="text"
                          value={pkg.name}
                          onChange={e => {
                            const updated = { ...pkg, name: e.target.value };
                            set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                          }}
                          className="bg-transparent font-bold text-white text-base focus:outline-none focus:border-b border-indigo-500 w-full"
                          placeholder="Package Name"
                        />
                        <input
                          type="text"
                          value={pkg.badge || ''}
                          onChange={e => {
                            const updated = { ...pkg, badge: e.target.value };
                            set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                          }}
                          placeholder="Badge Tag (e.g. Save 20%)"
                          className="bg-transparent text-[10px] text-indigo-400 uppercase font-mono tracking-wider focus:outline-none mt-1 w-full"
                        />
                      </div>

                      <button
                        onClick={() => {
                          remove(ref(db, `system/creditPackages/${pkgId}`));
                          addToast(`Deleted package ${pkg.name}`);
                        }}
                        className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
                        title="Delete Package"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Credits (PTS)</label>
                        <input
                          type="number"
                          value={pkg.credits}
                          onChange={e => {
                            const updated = { ...pkg, credits: parseInt(e.target.value) || 0 };
                            set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                          }}
                          className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-sm text-white font-bold focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Price (INR ₹)</label>
                        <input
                          type="number"
                          value={pkg.priceINR}
                          onChange={e => {
                            const updated = { ...pkg, priceINR: parseInt(e.target.value) || 0 };
                            set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                          }}
                          className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl font-mono text-sm text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Recommended For</label>
                      <input
                        type="text"
                        value={pkg.recommendedFor || ''}
                        onChange={e => {
                          const updated = { ...pkg, recommendedFor: e.target.value };
                          set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                        }}
                        placeholder="e.g. Pro Plan (Monthly)"
                        className="w-full bg-white/5 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 focus:outline-none"
                      />
                    </div>

                    {/* Toggle Popular Badge */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-400">Popular Badge Tag</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...pkg, popular: !pkg.popular };
                          set(ref(db, `system/creditPackages/${pkgId}`), encrypt(updated));
                        }}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${pkg.popular
                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                            : 'bg-white/5 text-slate-400 border-white/10'
                          }`}
                      >
                        {pkg.popular ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  </div>
                ))}

              {Object.keys(creditPackages).length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  No credit packages available. Click "Reset to Defaults" above to seed all pre-made cards.
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'payment_config' ? (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h2 className="text-xl font-bold text-white">Payment Method & Custom QR Code Config</h2>
              <p className="text-xs text-slate-400">Configure your active payment UPI ID, custom QR Code image, and direct DM links.</p>
            </div>

            <div className="glass-card p-8 rounded-3xl bg-white/[0.03] border border-white/10 space-y-6">

              {/* UPI ID Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Active Payment UPI ID</label>
                <input
                  type="text"
                  value={paymentConfig.upiId}
                  onChange={e => setPaymentConfig({ ...paymentConfig, upiId: e.target.value })}
                  placeholder="e.g. notexe@upi or yourname@paytm"
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-mono font-bold text-indigo-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Custom Payment QR Code Upload */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Payment QR Code Image</label>
                <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                  {paymentConfig.qrImageUrl ? (
                    <img src={paymentConfig.qrImageUrl} alt="Custom QR Preview" className="w-32 h-32 object-contain bg-white p-2 rounded-xl border border-white/20 shadow-lg" />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500 text-center p-2">
                      <QrCode size={32} />
                      <span className="text-[10px] mt-1">Default Auto-QR</span>
                    </div>
                  )}

                  <div className="space-y-3 flex-1">
                    <div className="text-xs text-slate-300">Upload a custom payment QR code image to display to users during payment:</div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setPaymentConfig({ ...paymentConfig, qrImageUrl: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                    />
                    {paymentConfig.qrImageUrl && (
                      <button
                        type="button"
                        onClick={() => setPaymentConfig({ ...paymentConfig, qrImageUrl: '' })}
                        className="text-xs text-rose-400 hover:text-rose-300 underline block"
                      >
                        Reset to Auto-Generated QR
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Social DM Links */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Discord Support Link</label>
                  <input
                    type="text"
                    value={paymentConfig.discordUrl}
                    onChange={e => setPaymentConfig({ ...paymentConfig, discordUrl: e.target.value })}
                    placeholder="https://discord.gg/yourserver"
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Instagram Support Link</label>
                  <input
                    type="text"
                    value={paymentConfig.instagramUrl}
                    onChange={e => setPaymentConfig({ ...paymentConfig, instagramUrl: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                    className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none"
                  />
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await set(ref(db, 'system/paymentConfig'), encrypt(paymentConfig));
                          addToast('Payment Config & QR Code updated successfully!');
                        } catch (e) {
                          console.error(e);
                          addToast('Failed to update payment config', 'error');
                        }
                      }}
                      className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl"
                    >
                      Save Payment & QR Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'credit_requests' ? (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Payment Proof Submissions</h2>
                    <p className="text-xs text-slate-400">Review customer payment screenshots and approve credit requests with 1 click.</p>
                  </div>

                  {/* DESKTOP TABLE VIEW */}
                  <div className="hidden md:block glass-card rounded-2xl overflow-hidden shadow-2xl bg-white/[0.02] border border-white/[0.05] overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-xs text-white min-w-[850px]">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="p-4">Customer</th>
                          <th className="p-4">Package</th>
                          <th className="p-4">Credits</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Proof & Notes</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.04]">
                        {Object.entries(creditRequests).map(([reqId, req]) => (
                          <tr key={reqId} className="hover:bg-white/[0.03] transition-colors">
                            <td className="p-4 font-semibold text-white">
                              <div>{req.userEmail}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{new Date(req.timestamp).toLocaleString()}</div>
                            </td>
                            <td className="p-4 text-slate-300 font-bold">{req.selectedPackage}</td>
                            <td className="p-4 font-mono font-bold text-indigo-400">+{req.creditsRequested} PTS</td>
                            <td className="p-4 font-mono font-bold text-emerald-400">₹{req.priceINR}</td>
                            <td className="p-4 space-y-1.5">
                              {req.screenshotBase64 ? (
                                <button
                                  onClick={() => setShowQrLightbox(req.screenshotBase64 || null)}
                                  className="px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all inline-flex items-center gap-1.5 text-xs text-indigo-300 font-medium"
                                >
                                  <ImageIcon size={14} /> View Screenshot
                                </button>
                              ) : (
                                <span className="text-slate-500 text-[10px] block">No Screenshot</span>
                              )}
                              {req.note && (
                                <div className="text-[11px] text-slate-300 bg-white/5 p-2 rounded-lg border border-white/10 font-mono break-all max-w-xs">
                                  <span className="text-[9px] text-slate-400 uppercase font-bold block mb-0.5">User Note / UTR:</span>
                                  {req.note}
                                </div>
                              )}
                            </td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${req.status === 'approved'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : req.status === 'rejected'
                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                {req.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {req.status === 'pending' && (
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={async () => {
                                      const emailKey = req.userEmail.replace(/\./g, ',');
                                      const snap = await get(ref(db, `customers/${emailKey}`));
                                      if (snap.exists()) {
                                        const currentCust = decrypt(snap.val()) as Customer;
                                        const updatedCust: Customer = {
                                          ...currentCust,
                                          credits: (currentCust.credits || 0) + req.creditsRequested
                                        };
                                        await set(ref(db, `customers/${emailKey}`), encrypt(updatedCust));
                                      }
                                      await set(ref(db, `system/creditRequests/${reqId}`), encrypt({ ...req, status: 'approved' }));
                                      addToast(`Approved request & added +${req.creditsRequested} PTS to ${req.userEmail}`);
                                    }}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md"
                                  >
                                    <CheckCircle2 size={13} /> Approve & Credit
                                  </button>
                                  <button
                                    onClick={async () => {
                                      await set(ref(db, `system/creditRequests/${reqId}`), encrypt({ ...req, status: 'rejected' }));
                                      addToast(`Rejected request from ${req.userEmail}`, 'error');
                                    }}
                                    className="px-3 py-1.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-xs font-bold uppercase tracking-wider"
                                  >
                                    Reject
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                        {Object.keys(creditRequests).length === 0 && (
                          <tr>
                            <td colSpan={7} className="p-12 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                              No credit top-up requests submitted yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE CARDS VIEW */}
                  <div className="md:hidden space-y-4">
                    {Object.keys(creditRequests).length === 0 ? (
                      <div className="glass-card p-8 text-center text-xs font-bold text-slate-500 uppercase tracking-widest rounded-2xl">
                        No credit top-up requests submitted yet.
                      </div>
                    ) : (
                      Object.entries(creditRequests).map(([reqId, req]) => (
                        <div key={reqId} className="glass-card p-5 rounded-2xl border border-white/10 space-y-4 bg-white/[0.03]">
                          <div className="flex justify-between items-start gap-2 border-b border-white/10 pb-3">
                            <div>
                              <div className="font-bold text-sm text-white break-all">{req.userEmail}</div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(req.timestamp).toLocaleString()}</div>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${req.status === 'approved'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : req.status === 'rejected'
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              }`}>
                              {req.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Package</span>
                              <span className="text-xs font-bold text-slate-200">{req.selectedPackage}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount & Credits</span>
                              <span className="text-xs font-mono font-bold text-emerald-400">₹{req.priceINR}</span>
                              <span className="text-[10px] font-mono text-indigo-400 block font-bold">+{req.creditsRequested} PTS</span>
                            </div>
                          </div>

                          {/* PROOF SCREENSHOT / NOTE */}
                          <div className="space-y-2">
                            <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Proof & Reference:</span>
                            {req.screenshotBase64 ? (
                              <button
                                onClick={() => setShowQrLightbox(req.screenshotBase64 || null)}
                                className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-500/25 transition-all"
                              >
                                <ImageIcon size={16} /> View Attached Screenshot
                              </button>
                            ) : (
                              <span className="text-slate-500 text-xs italic block">No image file attached</span>
                            )}

                            {req.note && (
                              <div className="text-xs text-slate-200 bg-white/5 p-3 rounded-xl border border-white/10 font-mono break-all">
                                <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">User Note / Transaction Note:</span>
                                {req.note}
                              </div>
                            )}
                          </div>

                          {/* ACTIONS */}
                          {req.status === 'pending' && (
                            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                              <button
                                onClick={async () => {
                                  const emailKey = req.userEmail.replace(/\./g, ',');
                                  const snap = await get(ref(db, `customers/${emailKey}`));
                                  if (snap.exists()) {
                                    const currentCust = decrypt(snap.val()) as Customer;
                                    const updatedCust: Customer = {
                                      ...currentCust,
                                      credits: (currentCust.credits || 0) + req.creditsRequested
                                    };
                                    await set(ref(db, `customers/${emailKey}`), encrypt(updatedCust));
                                  }
                                  await set(ref(db, `system/creditRequests/${reqId}`), encrypt({ ...req, status: 'approved' }));
                                  addToast(`Approved request & added +${req.creditsRequested} PTS to ${req.userEmail}`);
                                }}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                              >
                                <CheckCircle2 size={16} /> Approve & Add Credits
                              </button>
                              <button
                                onClick={async () => {
                                  await set(ref(db, `system/creditRequests/${reqId}`), encrypt({ ...req, status: 'rejected' }));
                                  addToast(`Rejected request from ${req.userEmail}`, 'error');
                                }}
                                className="w-full py-2.5 bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider border border-rose-500/20"
                              >
                                Reject Request
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </main>

              {/* Lightbox Modal for Payment Proof Screenshot */}
              {showQrLightbox && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                  <div className="relative max-w-2xl max-h-[85vh] bg-[#0c0d14] p-4 rounded-3xl border border-white/20 shadow-2xl">
                    <button onClick={() => setShowQrLightbox(null)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white">
                      <X size={20} />
                    </button>
                    <img src={showQrLightbox} alt="Payment Proof Screenshot" className="max-h-[75vh] w-full object-contain rounded-2xl" />
                  </div>
                </div>
              )}



              {
                showEditUserPlan && (
                  <Modal title="Edit Customer Plan" onClose={() => setShowEditUserPlan(null)}>
                    <div className="space-y-6">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-bold text-muted/50 uppercase mb-1">Customer</div>
                        <div className="font-mono text-sm">{customers[showEditUserPlan]?.email}</div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Select Plan</label>
                        <select
                          id="adminPlanSelect"
                          defaultValue={customers[showEditUserPlan]?.plan}
                          className="w-full bg-surfaceHighlight border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/30 text-white appearance-none cursor-pointer"
                        >
                          {Object.keys(plans).map(pn => <option key={pn} value={pn}>{pn}</option>)}
                        </select>
                      </div>
                      <button
                        onClick={async () => {
                          const newPlan = (document.getElementById('adminPlanSelect') as HTMLSelectElement).value;
                          const cust = { ...customers[showEditUserPlan], plan: newPlan };
                          await set(ref(db, `customers/${showEditUserPlan}`), encrypt(cust));
                          setShowEditUserPlan(null);
                          addToast('Customer plan updated');
                        }}
                        className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-all"
                      >
                        Update Plan
                      </button>
                    </div>
                  </Modal>
                )
              }

              {
                showGiveCredits !== null && (
                  <Modal title="Give Credits" onClose={() => setShowGiveCredits(null)}>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const d = new FormData(e.currentTarget);
                      const email = d.get('email') as string;
                      const amount = parseInt(d.get('amount') as string);
                      if (!email || isNaN(amount)) return;

                      const key = email.replace(/\./g, ',');
                      const snap = await get(ref(db, `customers/${key}`));
                      if (!snap.exists()) return addToast('User not found', 'error');

                      const cust = decrypt(snap.val());
                      cust.credits = (cust.credits || 0) + amount;
                      await set(ref(db, `customers/${key}`), encrypt(cust));
                      setShowGiveCredits(null);
                      addToast(`Added ${amount} credits to ${email}`);
                    }} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Customer Email</label>
                        <input name="email" defaultValue={showGiveCredits} placeholder="user@example.com" className="w-full bg-surfaceHighlight border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/30" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-muted uppercase tracking-widest ml-1">Amount</label>
                        <input name="amount" type="number" placeholder="1000" className="w-full bg-surfaceHighlight border border-white/10 p-4 rounded-xl focus:outline-none focus:border-white/30" required />
                      </div>
                      <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] text-xs">
                        Confirm Transaction
                      </button>
                    </form>
                  </Modal>
                )
              }

              {
                showCreatePlan && (
                  <Modal title="New System Plan" onClose={() => setShowCreatePlan(false)}>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const d = new FormData(e.currentTarget);
                      const name = d.get('name') as string;
                      if (!name) return;
                      const p: SystemPlan = {
                        maxApps: parseInt(d.get('maxApps') as string),
                        maxUsers: parseInt(d.get('maxUsers') as string),
                        onSale: (d.get('onSale') === 'on'),
                        creditPrice: parseInt(d.get('creditPrice') as string),
                        price: 'Credit Only',
                        order: Object.keys(plans).length
                      };
                      await set(ref(db, `system/plans/${name}`), encrypt(p));
                      setShowCreatePlan(false);
                      addToast('Plan Created');
                    }} className="space-y-4">
                      <input name="name" placeholder="Plan Name (e.g. Gold)" className="w-full bg-surfaceHighlight border border-border p-4 rounded-xl focus:outline-none" required />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted uppercase ml-1">Max Apps</label>
                          <input name="maxApps" type="number" defaultValue="5" className="w-full bg-surfaceHighlight border border-border p-4 rounded-xl focus:outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-muted uppercase ml-1">Max Users</label>
                          <input name="maxUsers" type="number" defaultValue="100" className="w-full bg-surfaceHighlight border border-border p-4 rounded-xl focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-muted uppercase ml-1">Credit Price</label>
                        <input name="creditPrice" type="number" defaultValue="500" className="w-full bg-surfaceHighlight border border-border p-4 rounded-xl focus:outline-none" />
                      </div>
                      <div className="flex items-center gap-2 p-2">
                        <input type="checkbox" name="onSale" id="os" />
                        <label htmlFor="os" className="text-sm text-muted">Show in public shop</label>
                      </div>
                      <button type="submit" className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-widest text-xs">Create Plan</button>
                    </form>
                  </Modal>
                )
              }





              {
                showEditPlan && plans[showEditPlan] && (
                  <InfrastructurePlanEditorModal
                    planName={showEditPlan}
                    initialPlan={plans[showEditPlan]}
                    onClose={() => setShowEditPlan(null)}
                    onSave={async (updatedPlan) => {
                      await set(ref(db, `system/plans/${showEditPlan}`), encrypt(updatedPlan));
                      await logPlanAction(showEditPlan, 'update', `Updated ${showEditPlan} configuration`);
                      setShowEditPlan(null);
                      addToast(`Updated ${showEditPlan} plan configuration`);
                    }}
                  />
                )
              }


              {
                confirmModal.show && (
                  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-surface border border-white/10 rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-scale-up">
                      <div className="p-10 text-center">
                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ${confirmModal.danger ? 'bg-danger/10 text-danger' : 'bg-white/10 text-white'}`}>
                          <AlertTriangle size={40} />
                        </div>
                        <h3 className="text-2xl font-black mb-3 tracking-tight">{confirmModal.title}</h3>
                        <p className="text-muted/60 text-sm mb-10 leading-relaxed px-4">{confirmModal.message}</p>
                        <div className="flex flex-col gap-3">
                          <button
                            onClick={() => confirmModal.onConfirm()}
                            className={`w-full font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-xs ${confirmModal.danger ? 'bg-danger text-white' : 'bg-white text-black'}`}
                          >
                            Confirm Action
                          </button>
                          <button
                            onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }


              {showSdkModal && (
                <SDKEditorModal
                  sdk={editingSdk}
                  onClose={() => setShowSdkModal(false)}
                  onSave={async (sdkData) => {
                    await saveSDK(sdkData);
                    addToast(`SDK ${sdkData.name} saved successfully`);
                  }}
                />
              )}

              <div className="fixed bottom-8 right-8 z-[500] flex flex-col gap-3">
                {toasts.map(t => (
                  <div key={t.id} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border shadow-2xl animate-fade-in-up ${t.type === 'error' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-success/10 border-success/20 text-success'}`}>
                    <div className={`w-2 h-2 rounded-full ${t.type === 'error' ? 'bg-danger' : 'bg-success'}`} />
                    <span className="text-sm font-bold tracking-tight">{t.msg}</span>
                  </div>
                ))}
              </div>
            </div >
            );
};

            export default Admin;
