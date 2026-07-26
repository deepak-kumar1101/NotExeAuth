import React from 'react';

type BrandMarkProps = {
  mode?: 'default' | 'compact';
  suffix?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
};

const BrandMark: React.FC<BrandMarkProps> = ({ mode = 'default', suffix, className = '', size, animated }) => {
  const compact = mode === 'compact' || size === 'sm';
  const isLg = size === 'lg';
  const outerRadius = compact ? 'rounded-xl' : isLg ? 'rounded-3xl' : 'rounded-2xl';
  const innerRadius = compact ? 'rounded-[11px]' : isLg ? 'rounded-[21px]' : 'rounded-[15px]';

  return (
    <div className={`flex items-center gap-3 select-none ${className}`.trim()}>
      <div className={`relative overflow-hidden ${outerRadius} border border-white/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.22),rgba(255,255,255,0.06))] shadow-[0_14px_40px_rgba(0,0,0,0.35)] transition-all duration-300 hover:border-white/30 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] ${animated ? 'animate-float-slow' : ''}`}>
        <div className={`absolute inset-[1px] ${innerRadius} bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),rgba(255,255,255,0.04)_45%,rgba(7,12,24,0.98)_100%)]`} />
        <div className={`relative flex items-center ${compact ? 'h-9 px-2.5' : isLg ? 'h-16 px-5' : 'h-11 px-3.5'} gap-2`}>
          <div className={`flex flex-col justify-center gap-1 ${compact ? 'mr-0.5' : 'mr-1'}`}>
            <span className={`${compact ? 'h-1.5 w-1.5' : isLg ? 'h-3 w-3' : 'h-2 w-2'} rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]`} />
            <span className={`${compact ? 'h-1 w-4' : isLg ? 'h-2 w-7' : 'h-1.5 w-5'} rounded-full bg-white/85`} />
            <span className={`${compact ? 'h-1 w-3' : isLg ? 'h-2 w-5' : 'h-1.5 w-4'} rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]`} />
          </div>
          <span className={`${compact ? 'text-[0.78rem]' : isLg ? 'text-xl' : 'text-[0.92rem]'} font-black tracking-[0.24em] text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.2)]`}>DXA</span>
        </div>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`${compact ? 'text-base' : isLg ? 'text-2xl' : 'text-lg'} font-bold tracking-tight text-white`}>DeepX</span>
        <span className={`${compact ? 'text-[0.58rem]' : isLg ? 'text-[0.75rem]' : 'text-[0.62rem]'} uppercase tracking-[0.34em] text-indigo-300/60 font-mono font-semibold`}>
          {suffix || 'Auth Control'}
        </span>
      </div>
    </div>
  );
};

export default BrandMark;
