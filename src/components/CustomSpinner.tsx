import React from 'react';

export const CustomSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ 
  size = 'md', 
  text 
}) => {
  const dimensionClass = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-12 h-12'
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className={`relative ${dimensionClass}`}>
        {/* Outer subtle glow ring */}
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20 dark:border-red-400/20" />
        
        {/* Primary rotating neon arc */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#E51D24] border-r-[#FF3B30] animate-spin shadow-[0_0_12px_#E51D24]" />
        
        {/* Inner counter-rotating cyan-blue arc */}
        <div className="absolute inset-1 rounded-full border-2 border-transparent border-b-[#00D2FF] border-l-[#3B82F6] animate-spin [animation-direction:reverse] [animation-duration:1.2s] shadow-[0_0_8px_#00D2FF]" />
        
        {/* Core pulsing glowing dot */}
        <div className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#FFFFFF] animate-ping" />
      </div>

      {text && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 tracking-wide font-sans animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="w-full space-y-4 p-6 rounded-2xl bg-slate-200/50 dark:bg-slate-800/40 animate-pulse border border-slate-300/40 dark:border-slate-700/40">
      <div className="h-6 w-1/2 bg-slate-300 dark:bg-slate-700 rounded-lg animate-shimmer" />
      <div className="h-12 w-full bg-slate-300/70 dark:bg-slate-700/60 rounded-xl animate-shimmer" />
      <div className="h-12 w-full bg-slate-300/70 dark:bg-slate-700/60 rounded-xl animate-shimmer" />
      <div className="h-12 w-full bg-slate-300/70 dark:bg-slate-700/60 rounded-xl animate-shimmer" />
      <div className="h-14 w-full bg-red-400/30 dark:bg-red-600/30 rounded-xl" />
    </div>
  );
};
