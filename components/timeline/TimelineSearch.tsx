import React from 'react';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  resultCount: number;
  totalCount: number;
}

export const TimelineSearch: React.FC<Props> = ({ value, onChange, resultCount, totalCount }) => {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-4 text-slate-400">
        <Search size={16} />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Realtime search by username, email, license key, app, or event description..."
        className="w-full bg-[#0d0f17]/90 border border-white/10 rounded-2xl pl-11 pr-24 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-16 p-1 text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>
      )}
      <span className="absolute right-4 font-mono text-[10px] text-slate-500 font-bold">
        {resultCount} / {totalCount}
      </span>
    </div>
  );
};
