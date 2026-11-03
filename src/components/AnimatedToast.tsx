import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Sparkles, X } from 'lucide-react';

interface AnimatedToastProps {
  toast: {
    message: string;
    type: 'success' | 'error' | 'info';
  } | null;
  onClose: () => void;
}

export const AnimatedToast: React.FC<AnimatedToastProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!toast) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const startTime = Date.now();
    const duration = 4000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
      <div 
        className={`relative overflow-hidden w-full max-w-sm rounded-2xl p-4 shadow-2xl backdrop-blur-2xl border transition-all duration-300 ${
          toast.type === 'success'
            ? 'bg-white/95 dark:bg-[#071318]/90 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 shadow-emerald-500/10'
            : toast.type === 'error'
            ? 'bg-white/95 dark:bg-[#1C0A0E]/90 border-red-500/40 text-red-950 dark:text-red-200 shadow-red-500/10'
            : 'bg-white/95 dark:bg-[#0B1528]/90 border-blue-500/40 text-blue-950 dark:text-blue-200 shadow-blue-500/10'
        }`}
      >
        {/* Glow corner accent */}
        <div 
          className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-xl pointer-events-none ${
            toast.type === 'success'
              ? 'bg-emerald-500/15'
              : toast.type === 'error'
              ? 'bg-red-500/20'
              : 'bg-blue-500/20'
          }`} 
        />

        <div className="flex items-start gap-3">
          <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 shrink-0 mt-0.5">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : toast.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-[#E51D24]" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-500" />
            )}
          </div>

          <div className="flex-1 pr-2">
            <h5 className="font-display font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {toast.type === 'success' ? 'Confirmed' : toast.type === 'error' ? 'Security Notice' : 'System Update'}
            </h5>
            <p className="font-semibold text-xs sm:text-sm mt-0.5 leading-snug">
              {toast.message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
          <div 
            className={`h-full transition-all duration-75 ease-linear ${
              toast.type === 'success' 
                ? 'bg-emerald-500' 
                : toast.type === 'error' 
                ? 'bg-[#E51D24]' 
                : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
