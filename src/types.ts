export type VerificationStatus =
  | 'waiting_for_verification'
  | 'captcha_required'
  | 'verification_completed'
  | 'otp_submitted'
  | 'request_failed'
  | 'rate_limited';

export type DispatchMode = 'direct' | 'relay';

export interface GarenaFormState {
  email: string;
  username: string;
  locale: string;
  dispatchMode: DispatchMode;
}

export interface DebugRecord {
  id: string;
  timestamp: string;
  durationMs: number;
  httpStatus: number;
  httpStatusText: string;
  statusType: VerificationStatus;
  statusMessage: string;
  captchaRequired: boolean;
  captchaUrl?: string;
  requestPayload: {
    username: string;
    email: string;
    locale: string;
    format: string;
    timestampId: string;
  };
  responseHeaders: Record<string, string>;
  responseBody: any;
  errorMessage?: string;
}

export interface LocaleOption {
  code: string;
  label: string;
  region: string;
  flag: string;
}

export const SUPPORTED_LOCALES: LocaleOption[] = [
  { code: 'en-SG', label: 'English (Singapore - Default)', region: 'Singapore / SEA', flag: '🇸🇬' },
  { code: 'en-US', label: 'English (Global / International)', region: 'Global', flag: '🌐' },
  { code: 'th-TH', label: 'ไทย (Thailand)', region: 'Thailand', flag: '🇹🇭' },
  { code: 'vi-VN', label: 'Tiếng Việt (Vietnam)', region: 'Vietnam', flag: '🇻🇳' },
  { code: 'id-ID', label: 'Bahasa Indonesia (Indonesia)', region: 'Indonesia', flag: '🇮🇩' },
  { code: 'zh-TW', label: '繁體中文 (Taiwan)', region: 'Taiwan', flag: '🇹🇼' },
  { code: 'ms-MY', label: 'Bahasa Melayu (Malaysia)', region: 'Malaysia', flag: '🇲🇾' },
  { code: 'ph-PH', label: 'English / Filipino (Philippines)', region: 'Philippines', flag: '🇵🇭' }
];
