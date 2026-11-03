import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RegistrationForm } from './components/RegistrationForm';
import { VerificationModal } from './components/VerificationModal';
import { ParticleBackground } from './components/ParticleBackground';
import { AnimatedToast } from './components/AnimatedToast';
import { GarenaFormState, DebugRecord, VerificationStatus } from './types';
import { ShieldCheck, Zap, Gem } from 'lucide-react';

const INITIAL_FORM_STATE: GarenaFormState = {
  email: '',
  username: '',
  locale: 'en-SG',
  dispatchMode: 'direct'
};

export default function App() {
  // Theme state: dark/light theme switcher (persisted in localStorage)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('garena_theme');
      if (saved) return saved === 'dark';
      return true; // Default to dark neon theme
    }
    return true;
  });

  const [formData, setFormData] = useState<GarenaFormState>(INITIAL_FORM_STATE);
  const [currentStatus, setCurrentStatus] = useState<VerificationStatus>('waiting_for_verification');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<DebugRecord | null>(null);
  const [isCaptchaModalOpen, setIsCaptchaModalOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync `.dark` class on root document
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('garena_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('garena_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
  };

  // Check health on mount
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        setIsBackendHealthy(res.ok);
      } catch {
        setIsBackendHealthy(false);
      }
    }
    checkHealth();
  }, []);

  // Hook: Automatically reset form state to initial clean state 3 seconds after successful OTP submission
  useEffect(() => {
    if (currentStatus === 'otp_submitted') {
      const resetTimer = setTimeout(() => {
        setFormData(INITIAL_FORM_STATE);
        setCurrentStatus('waiting_for_verification');
        setIsCaptchaModalOpen(false);
      }, 3000);

      return () => clearTimeout(resetTimer);
    }
  }, [currentStatus]);

  const handleInputChange = (field: keyof GarenaFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const executeApiCall = async (
    isRetryCheck = false,
    solvedCookie?: string,
    overrideMode?: 'direct' | 'relay'
  ) => {
    if (isRetryCheck) {
      setIsRetrying(true);
    } else {
      setIsLoading(true);
    }

    const activeMode = solvedCookie ? 'relay' : (overrideMode || formData.dispatchMode);

    // Direct mode if no cookie is yet solved (avoids cloud datacenter IP blocks)
    if (activeMode === 'direct' && !solvedCookie) {
      const startTime = performance.now();
      const timestampId = Date.now().toString();

      try {
        const params = new URLSearchParams({
          username: formData.username.trim(),
          email: formData.email.trim(),
          locale: formData.locale,
          format: 'json',
          id: timestampId
        });

        const headers: Record<string, string> = {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          'Accept': 'application/json'
        };

        const directResponse = await fetch('https://auth.garena.com/api/send_register_code_email', {
          method: 'POST',
          headers,
          body: params.toString()
        });

        const durationMs = Math.round(performance.now() - startTime);
        const rawText = await directResponse.text();
        let parsed: any = {};
        try {
          parsed = JSON.parse(rawText);
        } catch {
          parsed = { raw: rawText };
        }

        let statusType: VerificationStatus = 'waiting_for_verification';
        let statusMessage = 'Waiting for Verification';
        let captchaRequired = false;
        let captchaUrl: string | undefined = undefined;
        let errorMessage: string | undefined = undefined;

        if (directResponse.status === 403) {
          captchaRequired = true;
          statusType = 'captcha_required';
          statusMessage = 'CAPTCHA Required';
          if (parsed && typeof parsed.url === 'string') {
            captchaUrl = parsed.url;
          }
        } else if (directResponse.status === 429) {
          statusType = 'rate_limited';
          statusMessage = 'Rate Limited';
          errorMessage = 'Too many requests. Please wait a minute before retrying.';
        } else if (directResponse.status === 200) {
          if (parsed && (parsed.result === 0 || parsed.error === 0 || parsed.success === true)) {
            statusType = 'otp_submitted';
            statusMessage = 'OTP Request Submitted';
          } else {
            statusType = 'request_failed';
            statusMessage = parsed?.msg || parsed?.error || 'Request Failed';
          }
        }

        const record: DebugRecord = {
          id: `direct_${Date.now()}`,
          timestamp: new Date().toISOString(),
          durationMs,
          httpStatus: directResponse.status,
          httpStatusText: directResponse.statusText,
          statusType,
          statusMessage,
          captchaRequired,
          captchaUrl,
          requestPayload: {
            username: formData.username,
            email: formData.email,
            locale: formData.locale,
            format: 'json',
            timestampId
          },
          responseHeaders: {},
          responseBody: parsed,
          errorMessage
        };

        setCurrentRecord(record);
        setCurrentStatus(statusType);

        if (statusType === 'captcha_required') {
          setIsCaptchaModalOpen(true);
        } else if (statusType === 'otp_submitted') {
          showToast('Success! Garena sent the verification code.', 'success');
        } else if (errorMessage) {
          showToast(errorMessage, 'error');
        }

        return;
      } catch (directErr) {
        console.warn('Direct fetch error, falling back to backend relay:', directErr);
      }
    }

    // SERVER RELAY DISPATCH (Attaches solved cookie header)
    try {
      const response = await fetch('/api/garena/send-register-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          ...(solvedCookie ? { datadomeCookie: solvedCookie } : {})
        })
      });

      const record: DebugRecord = await response.json();

      setCurrentRecord(record);
      setCurrentStatus(record.statusType);

      if (record.statusType === 'captcha_required') {
        setIsCaptchaModalOpen(true);
      } else if (record.statusType === 'otp_submitted') {
        showToast('Success! Garena sent the verification code.', 'success');
      } else if (record.statusType === 'rate_limited') {
        showToast('Rate Limited: Too many requests sent.', 'error');
      } else if (record.errorMessage) {
        showToast(record.errorMessage, 'error');
      }
    } catch (err: any) {
      showToast('Network error: Could not reach verification server.', 'error');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeApiCall(false);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden transition-colors duration-500 font-sans selection:bg-[#E51D24] selection:text-white">
      
      {/* Animated Red Neon & Blue Glow Particle Canvas */}
      <ParticleBackground isDark={isDark} />

      {/* Animated Notification Toast with Progress Bar */}
      <AnimatedToast toast={toast} onClose={() => setToast(null)} />

      <div className="relative z-10 min-h-screen flex flex-col justify-between">
        
        {/* Top Header with Brand Mark and Dark/Light Switcher */}
        <Header 
          isDark={isDark} 
          onToggleTheme={toggleTheme} 
          isBackendHealthy={isBackendHealthy} 
        />

        {/* Main Hero Viewport (White-Blue & Bold Neon Typography) */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 flex items-center">
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Hero Column: Bold Fonts & Brand Identity */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-4 sm:space-y-6">
              
              <div className="space-y-1">
                <span className="inline-block text-xs sm:text-sm font-black uppercase tracking-widest text-blue-600 dark:text-cyan-400 bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 px-3.5 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                  Official Security Gateway
                </span>
                
                <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl tracking-tight text-slate-950 dark:text-white leading-[1.05] drop-shadow-sm pt-2">
                  Email
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E51D24] via-[#FF2B32] to-[#FF453A] drop-shadow-[0_4px_30px_rgba(229,29,36,0.5)]">
                    Verification
                  </span>
                </h1>
              </div>

              <p className="text-base sm:text-xl font-bold text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                Verify your email to continue with official Garena gaming & account services.
              </p>

              {/* 3D Glassmorphism Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 sm:pt-6 max-w-lg">
                <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-blue-200/50 dark:border-blue-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1.5" />
                  <div className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    Secure
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    & Reliable
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-blue-200/50 dark:border-blue-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <Zap className="w-5 h-5 text-amber-500 mb-1.5" />
                  <div className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    Fast
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Process
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-blue-200/50 dark:border-blue-900/40 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                  <Gem className="w-5 h-5 text-blue-500 dark:text-cyan-400 mb-1.5" />
                  <div className="font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                    Official
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                    Garena Auth
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Glassmorphism Card with Animated Gradient Borders & 3D CTA */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <RegistrationForm
                formData={formData}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                isLoading={isLoading}
              />
            </div>

          </div>
        </main>

        {/* Clean White Verification Modal with Slider */}
        <VerificationModal
          isOpen={isCaptchaModalOpen}
          onClose={() => setIsCaptchaModalOpen(false)}
          captchaUrl={currentRecord?.captchaUrl}
          email={formData.email}
          username={formData.username}
          dispatchMode={formData.dispatchMode}
          currentStatus={currentStatus}
          errorMessage={currentRecord?.errorMessage}
          isSubmitting={isLoading}
          onSwitchToDirectAndRetry={() => {
            setFormData((prev) => ({ ...prev, dispatchMode: 'direct' }));
            executeApiCall(false, undefined, 'direct');
          }}
          onCaptchaSolved={(cookie) => {
            setCurrentStatus('verification_completed');
            // Route through server relay so the solved DataDome cookie header is attached
            executeApiCall(false, cookie, 'relay');
          }}
          onRetry={() => executeApiCall(true, undefined, 'relay')}
          isRetrying={isRetrying}
        />

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
          <p>© Garena Online. Authorized registration and verification portal.</p>
        </footer>

      </div>
    </div>
  );
}
