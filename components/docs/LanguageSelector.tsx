import React from 'react';
import { SandboxLanguage } from '../../types/sandbox';
import { Code2, Terminal, FileCode, Cpu, Layers } from 'lucide-react';

interface LanguageSelectorProps {
  selectedLanguage: SandboxLanguage;
  onSelectLanguage: (lang: SandboxLanguage) => void;
}

const LANGUAGES: { id: SandboxLanguage; name: string; icon: React.ReactNode; color: string }[] = [
  { id: 'python', name: 'Python', icon: <FileCode size={14} />, color: 'text-amber-400' },
  { id: 'csharp', name: 'C# (.NET)', icon: <Code2 size={14} />, color: 'text-indigo-400' },
  { id: 'cpp', name: 'C++', icon: <Cpu size={14} />, color: 'text-sky-400' },
  { id: 'rust', name: 'Rust', icon: <Terminal size={14} />, color: 'text-orange-400' },
  { id: 'go', name: 'Go', icon: <Layers size={14} />, color: 'text-cyan-400' },
  { id: 'typescript', name: 'TypeScript', icon: <Code2 size={14} />, color: 'text-blue-400' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = React.memo(({
  selectedLanguage,
  onSelectLanguage
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
      {LANGUAGES.map(lang => {
        const isSelected = selectedLanguage === lang.id;
        return (
          <button
            key={lang.id}
            onClick={() => onSelectLanguage(lang.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
              isSelected
                ? 'bg-indigo-500/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.25)]'
                : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.08]'
            }`}
          >
            <span className={lang.color}>{lang.icon}</span>
            <span>{lang.name}</span>
          </button>
        );
      })}
    </div>
  );
});

LanguageSelector.displayName = 'LanguageSelector';
