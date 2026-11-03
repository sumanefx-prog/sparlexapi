import React from 'react';
import { Sun, Moon, Shield } from 'lucide-react';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isBackendHealthy: boolean | null;
}

export const Header: React.FC<HeaderProps> = ({ isDark, onToggleTheme, isBackendHealthy }) => {
  return (
    <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
      {/* Garena Brand Identity (Bold Typography & Flaming Neon Emblem) */}
      <div className="flex items-center gap-3 group cursor-default">
        <div className="relative w-10 h-10 flex items-center justify-center">
          {/* Subtle ambient neon glow behind logo */}
          <div className="absolute inset-0 rounded-full bg-[#E51D24]/30 blur-md group-hover:bg-[#E51D24]/50 transition-all duration-300" />
          
          {/* Official Garena Flame SVG */}
          <svg viewBox="0 0 200 200" fill="none" className="relative w-8 h-8 text-[#E51D24] drop-shadow-[0_2px_14px_rgba(229,29,36,0.6)] transition-transform duration-300 group-hover:scale-105">
            <path
              d="M178.6 86.4C175.2 60.1 155.8 38.6 131.2 30.5c-4.8-1.6-9.8-2.6-14.9-3.2-6.5-.8-13.1-.7-19.5.4-23.7 4-44.2 18-56.1 38.4-1.2 2-2.2 4.1-3.1 6.3-10.4 24.3-6.2 53.2 10.9 73.1 19.3 22.4 49.3 31.6 77.8 23.9 12.8-3.5 24.5-10.5 33.6-20.1 16.5-17.6 23.3-42.3 18.7-62.9zM100 155c-30.4 0-55-24.6-55-55s24.6-55 55-55c14.2 0 27.2 5.4 37 14.3-12.8-6.1-27.5-9.3-43-8.3-25.4 1.6-46.6 20.8-50.5 46.1-4.7 30.3 16.7 57.1 47 58.7 13.9.7 26.8-4 36.5-12.8-8.2 7.5-17.8 12-27 12z"
              fill="currentColor"
            />
            <path
              d="M142 98c-3.5-12.5-12.8-22.3-25-26.2 10.2 6.5 17 18 17 31.2 0 20.4-16.6 37-37 37-8.5 0-16.3-2.9-22.5-7.8 8.8 11.2 22.8 18.8 38.5 18.8 26.5 0 48-21.5 48-48 0-1.7-.1-3.3-.3-5-3.3 0-5.7 0-8.7 0z"
              fill="#FF3B30"
            />
          </svg>
        </div>

        <div className="flex flex-col">
          <span className="font-display font-black text-2xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-none">
            Garena
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-cyan-400 mt-0.5">
            Security Gate
          </span>
        </div>
      </div>

      {/* Right Controls: System Online Indicator + Dark/Light Theme Switcher */}
      <div className="flex items-center gap-3">
        {/* System Online Status Pill */}
        <div className="hidden xs:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-blue-200/60 dark:border-blue-900/50 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
          </span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-wide">
            {isBackendHealthy === false ? 'Connecting...' : 'System Online'}
          </span>
        </div>

        {/* Dark / Light Theme Switcher Button with 3D feel */}
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-blue-200/80 dark:border-blue-800/80 text-blue-600 dark:text-amber-400 hover:text-blue-700 dark:hover:text-amber-300 shadow-md hover:shadow-lg transition-all duration-300 active:scale-95 cursor-pointer backdrop-blur-md"
          title={isDark ? 'Switch to White Blue Theme' : 'Switch to Dark Neon Theme'}
        >
          {isDark ? (
            <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 transition-transform duration-300 hover:-rotate-12 text-blue-600" />
          )}
        </button>
      </div>
    </header>
  );
};
