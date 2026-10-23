import React from 'react';

type BrandMarkProps = {
  mode?: 'default' | 'compact';
  suffix?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  showText?: boolean;
};

const BrandMark: React.FC<BrandMarkProps> = ({ mode = 'default', suffix, className = '', size, animated, showText = true }) => {
  const compact = mode === 'compact' || size === 'sm';
  const isLg = size === 'lg';
  const isXl = size === 'xl';

  const avatarSize = compact ? 'w-8 h-8' : isXl ? 'w-20 h-20' : isLg ? 'w-14 h-14' : 'w-10 h-10';

  return (
    <div className={`flex items-center gap-3 select-none group cursor-pointer ${className}`.trim()}>
      {/* Circular Logo Mascot Avatar Badge */}
      <div className={`relative ${avatarSize} flex-shrink-0 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-yellow-400 to-cyan-400 shadow-[0_0_18px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_26px_rgba(245,158,11,0.65)] ${animated ? 'animate-pulse' : ''}`}>
        <div className="w-full h-full rounded-full overflow-hidden bg-[#07090e] flex items-center justify-center relative border border-amber-300/40">
          <img
            src="/logo.png"
            alt="Not Exe"
            className="w-full h-full object-cover object-center rounded-full scale-105"
          />
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-[#07090e] shadow-[0_0_8px_#f59e0b]" />
      </div>

      {/* Typography */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1.5">
            <span className={`${compact ? 'text-sm' : isXl ? 'text-2xl' : isLg ? 'text-xl' : 'text-base'} font-black tracking-tight text-white group-hover:text-amber-300 transition-colors`}>
              NOT<span className="text-amber-400 ml-1">EXE</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/30">
              AUTH
            </span>
          </div>
          <span className={`${compact ? 'text-[0.55rem]' : isLg ? 'text-[0.7rem]' : 'text-[0.6rem]'} uppercase tracking-[0.3em] text-slate-400 font-mono font-medium mt-1`}>
            {suffix || 'SECURITY SHIELD'}
          </span>
        </div>
      )}
    </div>
  );
};

export default BrandMark;
