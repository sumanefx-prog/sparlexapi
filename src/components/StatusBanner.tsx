import React from 'react';
import { VerificationStatus } from '../types';
import { 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  Flame,
  ArrowRight
} from 'lucide-react';

interface StatusBannerProps {
  status: VerificationStatus;
  httpStatus?: number;
  errorMessage?: string;
  onOpenCaptchaModal?: () => void;
  hasCaptchaUrl?: boolean;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  status,
  httpStatus,
  errorMessage,
  onOpenCaptchaModal,
  hasCaptchaUrl
}) => {
  const configs: Record<VerificationStatus, {
    title: string;
    description: string;
    badgeText: string;
    icon: React.ReactNode;
    bgClass: string;
    borderClass: string;
    textClass: string;
    badgeClass: string;
  }> = {
    waiting_for_verification: {
      title: 'Waiting for Verification',
      description: 'Fill in your registration credentials and click "Send Verification Code" to initiate the Garena authentication pipeline.',
      badgeText: 'IDLE / READY',
      icon: <Clock className="w-5 h-5 text-slate-400" />,
      bgClass: 'bg-slate-900/60',
      borderClass: 'border-slate-800',
      textClass: 'text-slate-200',
      badgeClass: 'text-slate-400 bg-slate-800/80 border-slate-700'
    },
    captcha_required: {
      title: 'CAPTCHA Required',
      description: 'Garena Bot Detection (DataDome / HTTP 403) requires official browser verification before an email OTP can be dispatched.',
      badgeText: 'ACTION REQUIRED (HTTP 403)',
      icon: <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />,
      bgClass: 'bg-red-950/20',
      borderClass: 'border-red-900/50',
      textClass: 'text-red-200',
      badgeClass: 'text-red-400 bg-red-950/80 border-red-800/80'
    },
    verification_completed: {
      title: 'Verification Completed',
      description: 'Identity verification succeeded through Garena authorized origin. Registration pipeline authorized.',
      badgeText: 'VERIFIED',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      bgClass: 'bg-emerald-950/20',
      borderClass: 'border-emerald-900/50',
      textClass: 'text-emerald-200',
      badgeClass: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80'
    },
    otp_submitted: {
      title: 'OTP Request Submitted',
      description: 'Garena API confirmed the verification code request. Check your inbox for the official verification email.',
      badgeText: 'DISPATCHED (HTTP 200)',
      icon: <Send className="w-5 h-5 text-emerald-400" />,
      bgClass: 'bg-emerald-950/20',
      borderClass: 'border-emerald-900/50',
      textClass: 'text-emerald-200',
      badgeClass: 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80'
    },
    request_failed: {
      title: 'Request Failed',
      description: errorMessage || 'Garena auth API returned an error response or network gateway failed.',
      badgeText: httpStatus ? `ERROR ${httpStatus}` : 'FAILED',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      bgClass: 'bg-amber-950/20',
      borderClass: 'border-amber-900/50',
      textClass: 'text-amber-200',
      badgeClass: 'text-amber-400 bg-amber-950/80 border-amber-800/80'
    },
    rate_limited: {
      title: 'Rate Limited',
      description: 'Too many verification attempts detected. Requests are temporarily throttled to comply with security policies.',
      badgeText: 'THROTTLED (HTTP 429)',
      icon: <Flame className="w-5 h-5 text-purple-400" />,
      bgClass: 'bg-purple-950/20',
      borderClass: 'border-purple-900/50',
      textClass: 'text-purple-200',
      badgeClass: 'text-purple-400 bg-purple-950/80 border-purple-800/80'
    }
  };

  const current = configs[status];

  return (
    <div className={`p-4 sm:p-5 rounded-xl border ${current.borderClass} ${current.bgClass} transition-all duration-300 relative overflow-hidden shadow-lg backdrop-blur-sm`}>
      {/* Subtle background red accent for Garena aesthetic when CAPTCHA is required */}
      {status === 'captcha_required' && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 shrink-0 mt-0.5">
            {current.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-display font-semibold text-base sm:text-lg text-white">
                {current.title}
              </h2>
              <span className={`text-[11px] font-mono uppercase tracking-wider font-semibold border px-2 py-0.5 rounded-md ${current.badgeClass}`}>
                {current.badgeText}
              </span>
            </div>
            <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${current.textClass}`}>
              {current.description}
            </p>
          </div>
        </div>

        {/* Action Button for CAPTCHA if needed */}
        {status === 'captcha_required' && onOpenCaptchaModal && (
          <button
            onClick={onOpenCaptchaModal}
            className="self-start sm:self-center shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#E51D24] hover:bg-[#d0141b] text-white shadow-md shadow-red-900/30 active:scale-95 transition-all"
          >
            <span>Open Verification Modal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
