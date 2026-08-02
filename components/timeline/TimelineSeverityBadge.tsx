import React from 'react';
import { AuditSeverity } from '../../types/audit';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';

interface Props {
  severity: AuditSeverity;
  size?: 'sm' | 'md';
}

export const TimelineSeverityBadge: React.FC<Props> = ({ severity, size = 'md' }) => {
  const styles = {
    Info: 'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-sky-500/10',
    Success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10',
    Warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10',
    Critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10'
  };

  const icons = {
    Info: <Info size={size === 'sm' ? 11 : 13} />,
    Success: <CheckCircle2 size={size === 'sm' ? 11 : 13} />,
    Warning: <AlertTriangle size={size === 'sm' ? 11 : 13} />,
    Critical: <ShieldAlert size={size === 'sm' ? 11 : 13} />
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase font-bold tracking-wider rounded-lg border shadow-sm ${
        size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[10px]'
      } ${styles[severity] || styles.Info}`}
    >
      {icons[severity]}
      <span>{severity}</span>
    </span>
  );
};
