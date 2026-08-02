import React from 'react';
import { SandboxEndpointPath } from '../../types/sandbox';
import { SANDBOX_ENDPOINTS } from '../../services/sandboxService';
import { Send, Key, UserCheck, ShieldAlert, Database, Layers } from 'lucide-react';

interface EndpointSelectorProps {
  selectedEndpoint: SandboxEndpointPath;
  onSelectEndpoint: (endpoint: SandboxEndpointPath) => void;
}

const endpointIcons: Record<string, React.ReactNode> = {
  '/login': <Key size={14} className="text-emerald-400" />,
  '/register': <UserCheck size={14} className="text-indigo-400" />,
  '/versioncheck': <Layers size={14} className="text-amber-400" />,
  '/getvariable': <Database size={14} className="text-purple-400" />,
  '/getvariables': <Database size={14} className="text-sky-400" />,
  '/isapplicationpaused': <ShieldAlert size={14} className="text-rose-400" />
};

export const EndpointSelector: React.FC<EndpointSelectorProps> = React.memo(({
  selectedEndpoint,
  onSelectEndpoint
}) => {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
        Target API Endpoint
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {SANDBOX_ENDPOINTS.map(ep => {
          const isSelected = selectedEndpoint === ep.path;
          return (
            <button
              key={ep.path}
              onClick={() => onSelectEndpoint(ep.path)}
              className={`p-3 rounded-2xl text-left border transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent border-indigo-500/50 text-white shadow-[0_0_20px_rgba(99,102,241,0.2)]'
                  : 'bg-white/[0.02] border-white/10 text-slate-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  {endpointIcons[ep.path] || <Send size={14} />}
                  <span className="font-mono text-xs font-bold">{ep.path}</span>
                </div>
                <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  POST
                </span>
              </div>
              <p className="text-[10px] text-slate-400/80 line-clamp-1 font-medium">
                {ep.name}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
});

EndpointSelector.displayName = 'EndpointSelector';
