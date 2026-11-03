import React, { useState } from 'react';
import { GarenaFormState, SUPPORTED_LOCALES } from '../types';
import { Mail, User, Globe, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { CustomSpinner } from './CustomSpinner';

interface RegistrationFormProps {
  formData: GarenaFormState;
  onChange: (field: keyof GarenaFormState, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  formData,
  onChange,
  onSubmit,
  isLoading
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <div className="relative w-full max-w-md mx-auto group">
      
      {/* Animated Gradient Border Outer Glow Container */}
      <div className="absolute -inset-[1.5px] rounded-3xl bg-[conic-gradient(from_0deg,#E51D24,#2563EB,#00D2FF,#E51D24)] animate-border-rotate opacity-75 dark:opacity-85 blur-[2px] transition-all duration-500 group-hover:opacity-100 group-hover:blur-[3px]" />

      {/* Glassmorphism Inner Verification Card */}
      <div className="relative bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/60 dark:border-blue-900/30 transition-all duration-300">
        
        {/* Dynamic Card Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white">
              Get Verification Code
            </h2>
            <p className="text-xs font-semibold text-blue-600 dark:text-cyan-400 mt-1">
              Authorized Garena Authentication Pipeline
            </p>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-cyan-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          
          {/* Interactive Email Address Field */}
          <div className="relative group/field">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div 
              className={`relative rounded-xl transition-all duration-300 ${
                focusedField === 'email' 
                  ? 'ring-4 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'hover:ring-2 hover:ring-slate-300/40 dark:hover:ring-slate-700/40'
              }`}
            >
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${
                focusedField === 'email' ? 'text-blue-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <Mail className="w-4 h-4" />
              </div>

              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter registered email"
                value={formData.email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => onChange('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50/90 dark:bg-[#070C18]/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800/80 outline-none transition-all duration-300 focus:border-blue-500 dark:focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Interactive Username Field */}
          <div className="relative group/field">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Username
            </label>
            <div 
              className={`relative rounded-xl transition-all duration-300 ${
                focusedField === 'username' 
                  ? 'ring-4 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'hover:ring-2 hover:ring-slate-300/40 dark:hover:ring-slate-700/40'
              }`}
            >
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${
                focusedField === 'username' ? 'text-blue-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <User className="w-4 h-4" />
              </div>

              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                placeholder="Enter Garena username"
                value={formData.username}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => onChange('username', e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50/90 dark:bg-[#070C18]/90 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800/80 outline-none transition-all duration-300 focus:border-blue-500 dark:focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Regional Locale Dropdown */}
          <div className="relative group/field">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Regional Server
            </label>
            <div 
              className={`relative rounded-xl transition-all duration-300 ${
                focusedField === 'locale' 
                  ? 'ring-4 ring-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'hover:ring-2 hover:ring-slate-300/40 dark:hover:ring-slate-700/40'
              }`}
            >
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-300 ${
                focusedField === 'locale' ? 'text-blue-500 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
              }`}>
                <Globe className="w-4 h-4" />
              </div>

              <select
                id="locale"
                value={formData.locale}
                onFocus={() => setFocusedField('locale')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => onChange('locale', e.target.value)}
                className="w-full pl-10 pr-10 py-3.5 bg-slate-50/90 dark:bg-[#070C18]/90 text-slate-900 dark:text-white font-semibold rounded-xl text-sm border border-slate-200 dark:border-slate-800/80 outline-none appearance-none cursor-pointer transition-all duration-300 focus:border-blue-500 dark:focus:border-cyan-400"
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option key={loc.code} value={loc.code} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium">
                    {loc.code} — {loc.label}
                  </option>
                ))}
              </select>

              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3D Action Button with Glowing Hover */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || !formData.email.trim() || !formData.username.trim()}
              className={`w-full py-4 px-6 rounded-2xl font-display font-black text-base text-white tracking-wide flex items-center justify-center gap-2.5 transition-all btn-3d cursor-pointer ${
                isLoading
                  ? 'bg-red-950 text-red-300 cursor-not-allowed opacity-90'
                  : 'bg-gradient-to-r from-[#E51D24] via-[#FF2B32] to-[#FF453A] shadow-lg shadow-red-600/35 hover:shadow-red-600/50'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <CustomSpinner size="sm" />
                  <span>Processing Verification...</span>
                </div>
              ) : (
                <>
                  <span>Send Verification Code</span>
                  <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </>
              )}
            </button>
          </div>

          {/* Clean Security Subtext */}
          <div className="pt-3 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400" />
            <span>End-to-End Encrypted Verification Dispatch</span>
          </div>

        </form>
      </div>

    </div>
  );
};
