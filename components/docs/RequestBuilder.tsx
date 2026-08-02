import React, { useState } from 'react';
import { SandboxEndpointPath, SandboxRequestConfig } from '../../types/sandbox';
import {
  Lock, Key, Box, User, Hash, Database, Clock, RefreshCcw,
  Eye, EyeOff, Play, ShieldAlert, Sparkles, Sliders
} from 'lucide-react';

interface RequestBuilderProps {
  endpoint: SandboxEndpointPath;
  config: SandboxRequestConfig;
  onChangeConfig: (update: Partial<SandboxRequestConfig>) => void;
  onExecute: () => void;
  loading: boolean;
  onReset: () => void;
}

export const RequestBuilder: React.FC<RequestBuilderProps> = React.memo(({
  endpoint,
  config,
  onChangeConfig,
  onExecute,
  loading,
  onReset
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Calculate estimated payload size
  const estimatedPayload = {
    secret: config.secret ? '***' : '',
    app: config.app,
    username: config.username,
    password: config.password ? '***' : '',
    hwid: config.hwid,
    version: config.version,
    ...(endpoint === '/getvariable' ? { varName: config.varName } : {})
  };

  const payloadSizeEstimate = Number((new Blob([JSON.stringify(estimatedPayload)]).size / 1024).toFixed(2));

  return (
    <div className="space-y-4">
      {/* Method & Header Overview Panel */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
            POST
          </span>
          <span className="text-slate-300 font-bold">{endpoint}</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px]">
          <span>Headers: <strong className="text-slate-200">2</strong></span>
          <span>Payload Size: <strong className="text-indigo-300">{payloadSizeEstimate} KB</strong></span>
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="space-y-3">
        {/* 1. Developer Secret & App Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Developer Secret</span>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-slate-500 hover:text-white"
              >
                {showSecret ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock size={14} />
              </div>
              <input
                type={showSecret ? 'text' : 'password'}
                value={config.secret}
                onChange={e => onChangeConfig({ secret: e.target.value })}
                placeholder="Developer Secret"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Application Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Box size={14} />
              </div>
              <input
                type="text"
                value={config.app}
                onChange={e => onChangeConfig({ app: e.target.value })}
                placeholder="MyApplication"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 2. Username & Password (Only for /login & /register) */}
        {(endpoint === '/login' || endpoint === '/register') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                Username / License Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={14} />
                </div>
                <input
                  type="text"
                  value={config.username}
                  onChange={e => onChangeConfig({ username: e.target.value })}
                  placeholder="demo_user"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Access Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Key size={14} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={config.password}
                  onChange={e => onChangeConfig({ password: e.target.value })}
                  placeholder="Access Password"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. HWID & Version */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Hardware ID (HWID)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Hash size={14} />
              </div>
              <input
                type="text"
                value={config.hwid}
                onChange={e => onChangeConfig({ hwid: e.target.value })}
                placeholder="HWID-8821-X992"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Application Version
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Sparkles size={14} />
              </div>
              <input
                type="text"
                value={config.version}
                onChange={e => onChangeConfig({ version: e.target.value })}
                placeholder="1.0.0"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Variable Name (Only for /getvariable) */}
        {endpoint === '/getvariable' && (
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
              Variable Key Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Database size={14} />
              </div>
              <input
                type="text"
                value={config.varName}
                onChange={e => onChangeConfig({ varName: e.target.value })}
                placeholder="API_KEY or SERVER_URL"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 font-mono"
              />
            </div>
          </div>
        )}

        {/* Advanced Options (Timestamp, Nonce, Dev Mode) */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3 pt-3">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sliders size={13} className="text-indigo-400" />
            <span>Advanced Execution Controls</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer">
              <span className="text-slate-300 font-medium text-[11px]">Auto Timestamp</span>
              <input
                type="checkbox"
                checked={config.autoTimestamp}
                onChange={e => onChangeConfig({ autoTimestamp: e.target.checked })}
                className="accent-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer">
              <span className="text-slate-300 font-medium text-[11px]">Auto Nonce</span>
              <input
                type="checkbox"
                checked={config.autoNonce}
                onChange={e => onChangeConfig({ autoNonce: e.target.checked })}
                className="accent-indigo-500"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onExecute}
          disabled={loading}
          className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-black uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCcw size={16} className="animate-spin" />
              <span>Executing API Request...</span>
            </>
          ) : (
            <>
              <Play size={16} className="fill-white" />
              <span>Execute Request</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="py-3.5 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-colors"
          title="Reset Form"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
    </div>
  );
});

RequestBuilder.displayName = 'RequestBuilder';
