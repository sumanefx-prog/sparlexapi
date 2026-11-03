import React from 'react';
import { ShieldCheck, Lock, EyeOff, FileKey, Server } from 'lucide-react';

export const SecurityBadge: React.FC = () => {
  return (
    <div className="bg-[#0E1424] border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <h3 className="font-display font-semibold text-sm text-white">
          Security & Origin Policy Compliance
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
          <Server className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Server-Side Proxy</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              API dispatches are routed exclusively via secure backend relay to eliminate client browser leaks.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
          <EyeOff className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Zero Cookie Exposure</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Set-Cookie & session tokens are scrubbed from telemetry headers to protect user privacy.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">No Password or OTP Storage</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ephemeral registration state only. Secrets and passkeys are never held or logged.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
          <FileKey className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-slate-200">Authorized CAPTCHA Origin</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Never imitates DataDome; challenges run on authorized provider origins only.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
