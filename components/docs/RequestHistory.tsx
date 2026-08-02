import React from 'react';
import { RequestHistoryItem } from '../../types/sandbox';
import { History, Trash2, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

interface RequestHistoryProps {
  history: RequestHistoryItem[];
  onSelectHistory: (item: RequestHistoryItem) => void;
  onClearHistory: () => void;
}

export const RequestHistory: React.FC<RequestHistoryProps> = React.memo(({
  history,
  onSelectHistory,
  onClearHistory
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-xs text-slate-400">
        <History size={16} className="mx-auto mb-1 text-slate-500" />
        <span>No request history recorded yet.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
          <History size={15} className="text-indigo-400" />
          <span>Request History (Last {history.length})</span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition-colors"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar pr-1">
        {history.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectHistory(item)}
            className="w-full p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/10 flex items-center justify-between text-xs font-mono transition-all text-left group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {item.success ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              ) : (
                <XCircle size={14} className="text-rose-400 shrink-0" />
              )}
              <span className="font-bold text-white truncate">{item.endpoint}</span>
              <span className="text-[10px] text-slate-500 font-medium shrink-0">{item.timestamp}</span>
            </div>

            <div className="flex items-center gap-3 shrink-0 ml-2">
              <span className="text-[10px] text-slate-400">{item.latencyMs}ms</span>
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${
                  item.success
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {item.status}
              </span>
              <ArrowUpRight size={14} className="text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

RequestHistory.displayName = 'RequestHistory';
