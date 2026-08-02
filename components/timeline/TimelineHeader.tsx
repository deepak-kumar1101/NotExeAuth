import React from 'react';
import { Shield, Download, FileJson, FileText, Activity } from 'lucide-react';
import { auditService } from '../../services/auditService';
import { AuditLogItem } from '../../types/audit';

interface Props {
  logs: AuditLogItem[];
  metrics: {
    total: number;
    criticalCount: number;
    warningCount: number;
    successCount: number;
    infoCount: number;
  };
}

export const TimelineHeader: React.FC<Props> = ({ logs, metrics }) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card-premium p-6 rounded-3xl border border-white/12 relative overflow-hidden glass-reflection">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
              <Activity size={14} className="text-indigo-400 animate-pulse" />
              <span>Realtime Audit Telemetry</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">
              User Activity Timeline & Audit Logs
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Centralized single source of truth for platform security, user authentication, subscription events, hardware locks, and Cloudflare Worker API activity.
            </p>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => auditService.exportToCSV(logs)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-colors shadow-sm cursor-pointer"
              title="Export filtered logs as CSV"
            >
              <Download size={14} className="text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => auditService.exportToJSON(logs)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-bold border border-white/10 transition-colors shadow-sm cursor-pointer"
              title="Export filtered logs as JSON"
            >
              <FileJson size={14} className="text-indigo-400" />
              <span>JSON</span>
            </button>

            <button
              onClick={() => auditService.exportToPDF(logs)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
              title="Export report as HTML/PDF"
            >
              <FileText size={14} />
              <span>PDF Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/10">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Total Logged Events
          </div>
          <div className="text-2xl font-black text-white">{metrics.total.toLocaleString()}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.02]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 mb-1">
            Critical Threats
          </div>
          <div className="text-2xl font-black text-rose-400">{metrics.criticalCount}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/[0.02]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 mb-1">
            Warnings
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics.warningCount}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">
            Success Events
          </div>
          <div className="text-2xl font-black text-emerald-400">{metrics.successCount}</div>
        </div>
      </div>
    </div>
  );
};
