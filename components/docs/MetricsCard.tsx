import React from 'react';
import { SandboxMetrics } from '../../types/sandbox';
import { Activity, Clock, Server, HardDrive, Send } from 'lucide-react';

interface MetricsCardProps {
  metrics: SandboxMetrics | null;
}

export const MetricsCard: React.FC<MetricsCardProps> = React.memo(({ metrics }) => {
  if (!metrics) return null;

  const isOk = metrics.httpStatus === 200;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/10 font-mono text-xs">
      {/* 1. Latency */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Activity size={12} className="text-indigo-400" />
          <span>Latency</span>
        </div>
        <div className="font-bold text-white text-sm">
          {metrics.latencyMs} <span className="text-[10px] text-slate-400">ms</span>
        </div>
      </div>

      {/* 2. Status */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Server size={12} className={isOk ? 'text-emerald-400' : 'text-rose-400'} />
          <span>Status</span>
        </div>
        <div className={`font-bold text-sm ${isOk ? 'text-emerald-400' : 'text-rose-400'}`}>
          {metrics.httpStatus} {metrics.statusText}
        </div>
      </div>

      {/* 3. Payload Size */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <HardDrive size={12} className="text-amber-400" />
          <span>Payload Size</span>
        </div>
        <div className="font-bold text-white text-sm">
          {metrics.payloadSizeKb} <span className="text-[10px] text-slate-400">KB</span>
        </div>
      </div>

      {/* 4. Response Time */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Clock size={12} className="text-sky-400" />
          <span>Total Time</span>
        </div>
        <div className="font-bold text-white text-sm">
          {metrics.responseTimeMs} <span className="text-[10px] text-slate-400">ms</span>
        </div>
      </div>

      {/* 5. Endpoint */}
      <div className="space-y-1 col-span-2 sm:col-span-1">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <Send size={12} className="text-purple-400" />
          <span>Endpoint</span>
        </div>
        <div className="font-bold text-indigo-300 text-sm truncate">
          {metrics.endpoint}
        </div>
      </div>
    </div>
  );
});

MetricsCard.displayName = 'MetricsCard';
