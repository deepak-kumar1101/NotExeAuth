import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, X, Command, Terminal, CornerDownLeft, Shield } from 'lucide-react';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { commandPaletteService } from '../services/commandPaletteService';
import { CommandGroup } from './CommandGroup';
import { UserRole } from '../types/commandPalette';

interface CommandPaletteProps {
  userRole?: UserRole;
  apps?: Record<string, any>;
  users?: Record<string, any>;
  licenses?: Record<string, any>;
  variables?: Record<string, any>;
  resellers?: Record<string, any>;
  currentApp?: string;
  userSecret?: string;
  actions?: {
    openCreateAppModal?: () => void;
    openCreateUserModal?: () => void;
    openCreateLicenseModal?: () => void;
    openCreateVariableModal?: () => void;
    openCreateResellerModal?: () => void;
    switchTab?: (tab: string) => void;
    selectApp?: (appName: string) => void;
    toggleMaintenance?: () => void;
  };
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  userRole = 'guest',
  apps,
  users,
  licenses,
  variables,
  resellers,
  currentApp,
  userSecret,
  actions
}) => {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    closePalette,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    groups,
    flatItems,
    executeItem,
    contextData
  } = useCommandPalette();

  // Sync userRole & currentPath to service when changed
  useEffect(() => {
    commandPaletteService.updateContextData({
      userRole,
      currentPath: location.pathname
    });
  }, [userRole, location.pathname]);

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  let currentGlobalOffset = 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Command Palette"
      className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-xl animate-fade-in flex items-start justify-center pt-[10vh] px-4 select-none"
      onClick={closePalette}
    >
      <div
        className="w-full max-w-[720px] bg-[#0c0e17]/95 border border-white/15 rounded-[24px] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden backdrop-blur-2xl transition-all animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Search Input Bar */}
        <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/[0.02]">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Type a command or search users, apps, licenses, variables..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none font-medium tracking-wide"
            aria-label="Search commands and resources"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono font-bold text-slate-400 bg-white/5 border border-white/10 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Results List Area */}
        <div className="max-h-[420px] overflow-y-auto p-2 custom-scrollbar">
          {flatItems.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
                <Terminal size={22} />
              </div>
              <h4 className="text-sm font-bold text-slate-300">No matching commands or resources</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Try searching for keywords like <span className="text-indigo-400 font-mono">dashboard</span>, <span className="text-indigo-400 font-mono">create user</span>, or <span className="text-indigo-400 font-mono">license</span>.
              </p>
            </div>
          ) : (
            groups.map(group => {
              const offsetForThisGroup = currentGlobalOffset;
              currentGlobalOffset += group.items.length;

              return (
                <CommandGroup
                  key={group.category}
                  group={group}
                  selectedIndex={selectedIndex}
                  itemIndexOffset={offsetForThisGroup}
                  onSelect={executeItem}
                  onMouseEnterItem={idx => setSelectedIndex(idx)}
                />
              );
            })
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-4 py-3 bg-white/[0.02] border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">↓</kbd>
              <span className="ml-1 text-slate-400">Navigate</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">↵</kbd>
              <span className="ml-1 text-slate-400">Select</span>
            </span>
            <span className="flex items-center gap-1 font-mono hidden sm:inline-flex">
              <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px]">ESC</kbd>
              <span className="ml-1 text-slate-400">Close</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Shield size={12} className={contextData.userRole === 'admin' ? 'text-amber-400' : 'text-indigo-400'} />
            <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-300">
              Role: <span className={contextData.userRole === 'admin' ? 'text-amber-300' : 'text-indigo-300'}>{contextData.userRole}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
