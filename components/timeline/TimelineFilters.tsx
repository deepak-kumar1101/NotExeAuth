import React from 'react';
import { AuditFilterState, AuditCategory, AuditSeverity, AuditActorType } from '../../types/audit';
import { Filter, RotateCcw } from 'lucide-react';

interface Props {
  filters: AuditFilterState;
  onChange: (update: Partial<AuditFilterState>) => void;
  onReset: () => void;
  applications: string[];
}

export const TimelineFilters: React.FC<Props> = ({ filters, onChange, onReset, applications }) => {
  const categories: (AuditCategory | 'all')[] = [
    'all',
    'Authentication',
    'Application',
    'User',
    'License',
    'Subscription',
    'Credit',
    'Variable',
    'Webhook',
    'Reseller',
    'Admin',
    'Security'
  ];

  const severities: (AuditSeverity | 'all')[] = ['all', 'Info', 'Success', 'Warning', 'Critical'];
  const actorTypes: (AuditActorType | 'all')[] = ['all', 'admin', 'developer', 'reseller', 'user', 'system', 'worker'];

  return (
    <div className="glass-card p-4 rounded-2xl border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
          <Filter size={14} className="text-indigo-400" />
          <span>Advanced Event Filters</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Reset Filters</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Date Range Preset */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Time Window
          </label>
          <select
            value={filters.dateRange}
            onChange={e => onChange({ dateRange: e.target.value as any })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Category
          </label>
          <select
            value={filters.category}
            onChange={e => onChange({ category: e.target.value as any })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
          >
            {categories.map(c => (
              <option key={c} value={c}>
                {c === 'all' ? 'All Categories' : c}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Severity
          </label>
          <select
            value={filters.severity}
            onChange={e => onChange({ severity: e.target.value as any })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
          >
            {severities.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All Severities' : s}
              </option>
            ))}
          </select>
        </div>

        {/* Actor Type */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Actor Type
          </label>
          <select
            value={filters.actorType}
            onChange={e => onChange({ actorType: e.target.value as any })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
          >
            {actorTypes.map(a => (
              <option key={a} value={a}>
                {a === 'all' ? 'All Actors' : a.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Application */}
        <div>
          <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1">
            Application
          </label>
          <select
            value={filters.application}
            onChange={e => onChange({ application: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/50"
          >
            <option value="all">All Applications</option>
            {applications.map(app => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
