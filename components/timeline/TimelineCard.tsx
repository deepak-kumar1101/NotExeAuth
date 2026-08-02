import React from 'react';
import { AuditLogItem } from '../../types/audit';
import { TimelineSeverityBadge } from './TimelineSeverityBadge';
import {
  Lock, Key, Users, Box, Database, Webhook, ShieldCheck,
  Crown, Coins, Hammer, AlertTriangle, ShieldAlert, Cpu, Terminal, ChevronRight
} from 'lucide-react';

interface Props {
  log: AuditLogItem;
  onSelect: (log: AuditLogItem) => void;
}

const getCategoryIcon = (category: string, type: string) => {
  if (category === 'Authentication' || type.includes('LOGIN')) return <Lock size={16} className="text-indigo-400" />;
  if (category === 'Application') return <Box size={16} className="text-sky-400" />;
  if (category === 'User') return <Users size={16} className="text-emerald-400" />;
  if (category === 'License') return <Key size={16} className="text-amber-400" />;
  if (category === 'Subscription') return <Crown size={16} className="text-purple-400" />;
  if (category === 'Credit') return <Coins size={16} className="text-amber-300" />;
  if (category === 'Variable') return <Database size={16} className="text-cyan-400" />;
  if (category === 'Webhook') return <Webhook size={16} className="text-pink-400" />;
  if (category === 'Reseller') return <ShieldCheck size={16} className="text-indigo-300" />;
  if (category === 'Admin') return <Hammer size={16} className="text-slate-300" />;
  return <ShieldAlert size={16} className="text-rose-400" />;
};

export const TimelineCard: React.FC<Props> = React.memo(({ log, onSelect }) => {
  const formattedDate = new Date(log.timestamp).toLocaleString();

  return (
    <div
      onClick={() => onSelect(log)}
      className="group p-4 bg-[#0c0e17]/90 border border-white/10 hover:border-indigo-500/40 rounded-2xl cursor-pointer transition-all duration-200 hover:translate-x-1 shadow-md hover:shadow-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-3.5 min-w-0 flex-1">
        {/* Category Icon */}
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-all shrink-0 mt-0.5 sm:mt-0">
          {getCategoryIcon(log.category, log.type)}
        </div>

        {/* Title & Details */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black uppercase font-mono tracking-wider text-slate-300">
              {log.type.replace(/_/g, ' ')}
            </span>
            <TimelineSeverityBadge severity={log.severity} size="sm" />
            <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
              {log.category}
            </span>
          </div>

          <p className="text-xs text-slate-200 font-medium leading-relaxed">
            {log.description}
          </p>

          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 flex-wrap pt-0.5">
            {log.actorEmail && (
              <span>
                Actor: <span className="text-slate-300 font-bold">{log.actorEmail}</span>
              </span>
            )}
            {log.application && (
              <span>
                App: <span className="text-indigo-300 font-bold">{log.application}</span>
              </span>
            )}
            {log.username && (
              <span>
                User: <span className="text-emerald-300 font-bold">{log.username}</span>
              </span>
            )}
            {log.licenseKey && (
              <span>
                Key: <span className="text-amber-300 font-bold">{log.licenseKey}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right Meta Column */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0 gap-2">
        <span className="text-[11px] font-mono text-slate-400 font-semibold">{formattedDate}</span>
        <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>Inspect</span>
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
});

TimelineCard.displayName = 'TimelineCard';
