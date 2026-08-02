import React from 'react';
import {
  LayoutDashboard, ShoppingCart, BookOpen, Settings, Crown,
  PlusCircle, UserPlus, Key, Database, Share2, ShieldCheck,
  Code2, Sliders, CreditCard, FileText, Hammer, Box, Compass, Search, Activity
} from 'lucide-react';
import { CommandItemData } from '../types/commandPalette';

interface CommandItemProps {
  item: CommandItemData;
  isSelected: boolean;
  onSelect: (item: CommandItemData) => void;
  onMouseEnter: () => void;
}

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  ShoppingCart,
  BookOpen,
  Settings,
  Crown,
  PlusCircle,
  UserPlus,
  Key,
  Database,
  Share2,
  ShieldCheck,
  Code2,
  Sliders,
  CreditCard,
  FileText,
  Hammer,
  Box,
  Compass,
  Search,
  Activity
};

export const CommandItem: React.FC<CommandItemProps> = React.memo(({
  item,
  isSelected,
  onSelect,
  onMouseEnter
}) => {
  const IconComponent = iconMap[item.iconName] || Search;

  return (
    <div
      role="option"
      id={`cmd-item-${item.id}`}
      aria-selected={isSelected}
      onClick={() => onSelect(item)}
      onMouseEnter={onMouseEnter}
      className={`group flex items-center justify-between px-4 py-3 rounded-2xl cursor-pointer transition-all duration-150 select-none text-left border ${
        isSelected
          ? 'bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-transparent border-indigo-500/40 text-white shadow-[0_0_25px_rgba(99,102,241,0.25)] translate-x-1'
          : 'bg-transparent border-transparent hover:bg-white/[0.04] text-slate-300'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className={`p-2.5 rounded-xl border transition-all ${
          isSelected
            ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-300 shadow-md'
            : 'bg-white/5 border-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/10'
        }`}>
          <IconComponent size={18} />
        </div>
        <div className="truncate flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold tracking-tight truncate ${isSelected ? 'text-white font-extrabold' : 'text-slate-200'}`}>
              {item.title}
            </span>
          </div>
          <p className="text-[11px] text-slate-400/80 truncate mt-0.5 font-medium">
            {item.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-3">
        {item.shortcut && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border uppercase tracking-wider ${
            isSelected
              ? 'bg-indigo-500/30 border-indigo-400/50 text-indigo-200 shadow-sm'
              : 'bg-white/5 border-white/10 text-slate-400'
          }`}>
            {item.shortcut}
          </span>
        )}
      </div>
    </div>
  );
});

CommandItem.displayName = 'CommandItem';
