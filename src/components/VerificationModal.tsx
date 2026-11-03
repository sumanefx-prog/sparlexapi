import React, { useState, useEffect, useRef } from 'react';
import { VerificationStatus } from '../types';
import { 
  X, 
  RotateCw, 
  CheckCircle2, 
  ExternalLink,
  Loader2,
  AlertTriangle,
  Zap,
  Globe,
  MailCheck,
  ArrowRight
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  captchaUrl?: string;
  email: string;
  username: string;
  dispatchMode: 'direct' | 'relay';
  currentStatus: VerificationStatus;
  errorMessage?: string;
  isSubmitting: boolean;
  onSwitchToDirectAndRetry: () => void;
  onCaptchaSolved: (cookie?: string) => void;
  onRetry: () => void;
  isRetrying: boolean;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  captchaUrl,
  email,
  username,
  dispatchMode,
  currentStatus,
  errorMessage,
  isSubmitting,
  onSwitchToDirectAndRetry,
  onCaptchaSolved,
  onRetry,
  isRetrying
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [isSolved, setIsSolved] = useState(false);
  const [isHardblocked, setIsHardblocked] = useState(false);
  const [lastSolvedCookie, setLastSolvedCookie] = useState<string | undefined>(undefined);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Default target URL if none provided
  const targetUrl = captchaUrl || 'https://auth.garena.com/universal/register';

  // Listen for official DataDome postMessage events
  useEffect(() => {
    if (!isOpen) {
      setIsSolved(false);
      setIsHardblocked(false);
      setIframeLoading(true);
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        let payload: any = event.data;
        if (typeof payload === 'string') {
          payload = JSON.parse(payload);
        }

        // DataDome emits responseType 'hardblock' when datacenter cloud IP is flagged
        if (payload && payload.responseType === 'hardblock') {
          setIsHardblocked(true);
        }

        // DataDome emits eventType 'passed' when slider is solved
        if (payload && (payload.eventType === 'passed' || payload.responseType === 'passed')) {
          setIsSolved(true);
          setIsHardblocked(false);
          const solvedCookie = payload.cookie;
          setLastSolvedCookie(solvedCookie);
          
          onCaptchaSolved(solvedCookie);
        }
      } catch {
        // Safe to ignore non-DataDome messages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onCaptchaSolved]);

  if (!isOpen) return null;

  const handleReloadIframe = () => {
    setIframeLoading(true);
    setIsSolved(false);
    setIsHardblocked(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleManualConfirm = () => {
    setIsSolved(true);
    onCaptchaSolved(lastSolvedCookie);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-headline"
    >
      {/* Clean White Modal matching the reference screenshot */}
      <div className="bg-white text-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2">
            <h3 id="modal-headline" className="font-display font-medium text-base sm:text-lg text-slate-900">
              Verification Required
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReloadIframe}
              title="Refresh CAPTCHA challenge"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hardblock Banner if cloud IP or network is restricted */}
        {isHardblocked && (
          <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-900 flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Connection Restricted by Security Gate:</strong>
                <p className="mt-0.5 text-[11px] text-amber-800">
                  Switch to <strong>Direct Device Dispatch</strong> to generate the slider from your personal connection.
                </p>
              </div>
            </div>
            <button
              onClick={onSwitchToDirectAndRetry}
              className="w-full py-2 px-3 rounded-lg bg-[#E51D24] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:bg-[#d0141b] active:scale-95 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Switch to Direct Device & Reload Slider</span>
            </button>
          </div>
        )}

        {/* Modal Body: Embedded Official Interactive Slider or Result State */}
        <div className="relative flex-1 min-h-[360px] sm:min-h-[400px] bg-white flex flex-col items-center justify-center p-4">
          
          {/* STATE 1: SUCCESS - OTP Dispatched! */}
          {currentStatus === 'otp_submitted' ? (
            <div className="py-8 px-4 text-center animate-in zoom-in-95 duration-200 w-full">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
                <MailCheck className="w-9 h-9" />
              </div>
              <h4 className="font-display font-bold text-xl text-slate-900">
                OTP Sent Successfully!
              </h4>
              <p className="text-xs text-slate-600 mt-2 max-w-xs mx-auto">
                Garena has accepted your registration verification and sent the 6-digit OTP code to:
              </p>
              <div className="mt-3 font-mono text-sm font-bold text-slate-900 bg-slate-100 py-2 px-4 rounded-xl inline-block border border-slate-200">
                {email}
              </div>
              <p className="text-[11px] text-slate-500 mt-2.5">
                Check your email inbox (and Spam/Junk folder) to complete registration.
              </p>
              <button
                onClick={onClose}
                className="mt-6 w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
              >
                Done / Return to Dashboard
              </button>
            </div>
          ) : isSolved && (isSubmitting || isRetrying) ? (
            /* STATE 2: Submitting solved token to API */
            <div className="py-12 px-6 text-center animate-in zoom-in-95 duration-200">
              <Loader2 className="w-12 h-12 text-[#E51D24] animate-spin mx-auto mb-4" />
              <h4 className="font-display font-bold text-lg text-slate-900">
                Slider Passed! Sending OTP...
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-xs mx-auto">
                Submitting verification clearance to authentication server...
              </p>
              <div className="mt-3 font-mono text-xs text-red-600 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100">
                Target: {email}
              </div>
            </div>
          ) : isSolved && currentStatus === 'request_failed' ? (
            /* STATE 3: Solved, but Garena returned an error */
            <div className="py-8 px-4 text-center animate-in zoom-in-95 duration-200 w-full">
              <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-rose-200 shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h4 className="font-display font-bold text-lg text-slate-900">
                Garena Response Issue
              </h4>
              <div className="mt-3 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-medium text-left leading-relaxed">
                {errorMessage || 'Garena API rejected the request. Please verify your username and email.'}
              </div>
              <div className="mt-5 flex gap-2 w-full">
                <button
                  onClick={handleReloadIframe}
                  className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Reload Slider
                </button>
                <button
                  onClick={handleManualConfirm}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-[#E51D24] hover:bg-[#d0141b] text-white font-semibold text-xs shadow transition-colors cursor-pointer"
                >
                  Retry Dispatch
                </button>
              </div>
            </div>
          ) : (
            /* STATE 4: Active Iframe with Slider */
            <>
              {iframeLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
                  <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-2" />
                  <span className="text-xs font-medium text-slate-500">
                    Loading verification slider...
                  </span>
                </div>
              )}

              {targetUrl ? (
                <iframe
                  key={iframeKey}
                  ref={iframeRef}
                  src={targetUrl}
                  title="Security Verification Challenge"
                  className="w-full h-[360px] sm:h-[390px] border-0 rounded-xl"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  onLoad={() => setIframeLoading(false)}
                />
              ) : (
                <div className="text-center p-6 text-xs text-slate-500">
                  No active CAPTCHA challenge URL provided.
                </div>
              )}
            </>
          )}

        </div>

        {/* Quick Help for "Access is temporarily restricted" */}
        {!isSolved && !isHardblocked && currentStatus !== 'otp_submitted' && (
          <div className="px-5 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Seeing "Access restricted"?</span>
            <button
              onClick={onSwitchToDirectAndRetry}
              className="text-red-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Zap className="w-3 h-3 text-red-600" />
              <span>Use Direct Device Mode</span>
            </button>
          </div>
        )}

        {/* Modal Bottom Bar */}
        {currentStatus !== 'otp_submitted' && (
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span>Target:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[150px]">{username}</span>
              <span>·</span>
              <span className="truncate max-w-[140px]">{email}</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={handleManualConfirm}
                disabled={isSubmitting || isRetrying}
                className="w-full sm:w-auto px-3.5 py-1.5 bg-[#E51D24] hover:bg-[#d0141b] text-white rounded-lg font-medium text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {isSubmitting || isRetrying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <span>Slider Solved — Send OTP</span>
                )}
              </button>

              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Open directly in browser tab"
                className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1 text-[11px] font-medium"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Open Tab</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
