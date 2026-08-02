import React, { useState } from 'react';
import { AuditLogItem } from '../../types/audit';
import { TimelineSeverityBadge } from './TimelineSeverityBadge';
import { X, Copy, Check, Terminal, Shield, Cpu, Globe, ArrowRight } from 'lucide-react';

interface Props {
  log: AuditLogItem | null;
  onClose: () => void;
}

export const TimelineDrawer: React.FC<Props> = ({ log, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-end bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl bg-[#0c0e17] border-l border-white/15 h-full flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Top Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TimelineSeverityBadge severity={log.severity} />
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">
                {log.category}
              </span>
            </div>
            <h3 className="text-lg font-black text-white uppercase font-mono tracking-tight">
              {log.type}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-xs">
          {/* Description Box */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
              Event Summary
            </div>
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              {log.description}
            </p>
          </div>

          {/* Key Attributes Grid */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Event ID</span>
              <span className="text-slate-300 font-bold">{log.eventId}</span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Timestamp</span>
              <span className="text-slate-300 font-bold">{new Date(log.timestamp).toLocaleString()}</span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Actor Type</span>
              <span className="text-indigo-300 font-bold uppercase">{log.actorType}</span>
            </div>

            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Status</span>
              <span className={log.status === 'SUCCESS' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {log.status}
              </span>
            </div>
          </div>

          {/* Network & Device Details */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Globe size={13} className="text-sky-400" />
              <span>Network & Device Telemetry</span>
            </h4>
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">IP Address:</span>
                <span className="text-slate-200 font-bold">{log.ip || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Country:</span>
                <span className="text-slate-200 font-bold">{log.country || 'Global'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">User Agent:</span>
                <span className="text-slate-200 font-bold truncate max-w-[240px]" title={log.device}>
                  {log.device || 'N/A'}
                </span>
              </div>
              {log.hwid && (
                <div className="flex justify-between border-t border-white/10 pt-2 text-indigo-300">
                  <span>HWID Fingerprint:</span>
                  <span className="font-bold truncate max-w-[240px]">{log.hwid}</span>
                </div>
              )}
            </div>
          </div>

          {/* Previous vs New Values Diff */}
          {(log.previousValue || log.newValue) && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ArrowRight size={13} className="text-amber-400" />
                <span>State Change Diff</span>
              </h4>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl space-y-1">
                  <span className="text-[10px] text-rose-400 font-bold uppercase">Previous State</span>
                  <pre className="text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.previousValue, null, 2) || 'None'}
                  </pre>
                </div>
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">New State</span>
                  <pre className="text-[10px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(log.newValue, null, 2) || 'None'}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Raw JSON Inspector */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Terminal size={13} className="text-indigo-400" />
                <span>Raw Audit JSON Payload</span>
              </h4>
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1 text-[10px] font-mono font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 px-2 py-1 rounded border border-white/10 transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 bg-black/80 rounded-2xl border border-white/10 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed custom-scrollbar max-h-72">
              <code>{JSON.stringify(log, null, 2)}</code>
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>Security Audit Vault</span>
          <span>Immutable Record</span>
        </div>
      </div>
    </div>
  );
};
