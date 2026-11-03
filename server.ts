import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Request body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Simple in-memory rate limiter per IP: max 10 requests per 60s
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 10;

  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSec: 60 };
  }

  if (record.count >= maxRequests) {
    const resetInSec = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  const resetInSec = Math.ceil((record.resetTime - now) / 1000);
  return { allowed: true, remaining: maxRequests - record.count, resetInSec };
}

// In-memory debug log buffer (limited to last 25 records, sanitizing all cookies/tokens)
interface DebugRecord {
  id: string;
  timestamp: string;
  durationMs: number;
  httpStatus: number;
  httpStatusText: string;
  statusType: 'waiting_for_verification' | 'captcha_required' | 'verification_completed' | 'otp_submitted' | 'request_failed' | 'rate_limited';
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

const debugHistory: DebugRecord[] = [];

// Helper: safe header filtering to avoid leaking session cookies or private headers
const ALLOWED_HEADERS = [
  'content-type',
  'date',
  'server',
  'x-datadome',
  'x-datadome-cid',
  'x-dd-b',
  'cache-control',
  'pragma',
  'connection',
  'content-encoding',
  'transfer-encoding',
  'access-control-allow-origin',
  'access-control-allow-credentials'
];

function filterHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Exclude set-cookie, authorization, cookie
    if (lowerKey === 'set-cookie' || lowerKey === 'cookie' || lowerKey === 'authorization') {
      return;
    }
    if (ALLOWED_HEADERS.includes(lowerKey) || lowerKey.startsWith('x-')) {
      result[key] = value;
    }
  });
  return result;
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    serverTime: new Date().toISOString(),
    garenaEndpoint: 'https://auth.garena.com/api/send_register_code_email',
    environment: process.env.NODE_ENV || 'development'
  });
});

// History endpoint
app.get('/api/garena/history', (req: Request, res: Response) => {
  res.json({
    history: debugHistory,
    total: debugHistory.length
  });
});

// Clear history endpoint
app.delete('/api/garena/history', (req: Request, res: Response) => {
  debugHistory.length = 0;
  res.json({ success: true, message: 'History log cleared' });
});

// Core POST handler to send verification code email
app.post('/api/garena/send-register-code', async (req: Request, res: Response): Promise<void> => {
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  const rateLimit = checkRateLimit(clientIp);

  res.setHeader('X-RateLimit-Limit', '10');
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString());
  res.setHeader('X-RateLimit-Reset', rateLimit.resetInSec.toString());

  if (!rateLimit.allowed) {
    const record: DebugRecord = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      durationMs: 0,
      httpStatus: 429,
      httpStatusText: 'Too Many Requests',
      statusType: 'rate_limited',
      statusMessage: 'Rate Limited: Excessive requests detected. Please wait before retrying.',
      captchaRequired: false,
      requestPayload: {
        username: String(req.body.username || '').slice(0, 30),
        email: String(req.body.email || '').slice(0, 50),
        locale: String(req.body.locale || 'en-SG'),
        format: 'json',
        timestampId: Date.now().toString()
      },
      responseHeaders: {
        'content-type': 'application/json',
        'retry-after': rateLimit.resetInSec.toString()
      },
      responseBody: {
        error: 'rate_limited',
        message: `Too many requests. Please wait ${rateLimit.resetInSec} seconds before trying again.`
      },
      errorMessage: `Rate limit exceeded. Reset in ${rateLimit.resetInSec}s.`
    };
    debugHistory.unshift(record);
    if (debugHistory.length > 25) debugHistory.pop();

    res.status(429).json(record);
    return;
  }

  const { email, username, locale = 'en-SG', datadomeCookie } = req.body;

  // Strict Validation
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    res.status(400).json({
      error: 'invalid_email',
      message: 'Please provide a valid, well-formed email address.'
    });
    return;
  }

  if (!username || typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 32) {
    res.status(400).json({
      error: 'invalid_username',
      message: 'Username must be between 3 and 32 characters.'
    });
    return;
  }

  const cleanEmail = email.trim();
  const cleanUsername = username.trim();
  const cleanLocale = typeof locale === 'string' && locale ? locale.trim() : 'en-SG';
  const timestampId = Date.now().toString();

  const formData = new URLSearchParams({
    username: cleanUsername,
    email: cleanEmail,
    locale: cleanLocale,
    format: 'json',
    id: timestampId
  });

  const forwardedIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || clientIp;
  const clientUserAgent = (req.headers['user-agent'] as string) || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Accept': 'application/json',
    'User-Agent': clientUserAgent,
    'X-Forwarded-For': forwardedIp,
    'X-Real-IP': forwardedIp,
    'CF-Connecting-IP': forwardedIp,
    'True-Client-IP': forwardedIp
  };

  // Robustly extract and attach the DataDome solved token
  if (typeof datadomeCookie === 'string' && datadomeCookie.trim().length > 5) {
    let raw = datadomeCookie.trim();
    if (raw.includes(';')) {
      raw = raw.split(';')[0].trim();
    }
    if (raw.toLowerCase().startsWith('datadome=')) {
      raw = raw.substring(9).trim();
    }
    const match = raw.match(/[a-zA-Z0-9_\-~+=/.]+/);
    if (match && match[0].length > 5) {
      requestHeaders['Cookie'] = `datadome=${match[0]}`;
    }
  }

  const startTime = performance.now();
  let garenaStatus = 500;
  let garenaStatusText = 'Internal Error';
  let responseHeaders: Record<string, string> = {};
  let rawBodyText = '';
  let parsedJson: any = null;
  let errorMessage: string | undefined;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const garenaResponse = await fetch('https://auth.garena.com/api/send_register_code_email', {
      method: 'POST',
      headers: requestHeaders,
      body: formData.toString(),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    garenaStatus = garenaResponse.status;
    garenaStatusText = garenaResponse.statusText;
    responseHeaders = filterHeaders(garenaResponse.headers);

    rawBodyText = await garenaResponse.text();
    try {
      parsedJson = JSON.parse(rawBodyText);
    } catch {
      parsedJson = { raw: rawBodyText };
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      garenaStatus = 504;
      garenaStatusText = 'Gateway Timeout';
      errorMessage = 'Request to Garena auth servers timed out after 30 seconds.';
      parsedJson = { error: 'timeout', message: errorMessage };
    } else {
      garenaStatus = 502;
      garenaStatusText = 'Bad Gateway';
      errorMessage = err.message || 'Network error reaching Garena authentication service.';
      parsedJson = { error: 'network_error', message: errorMessage };
    }
  }

  const durationMs = Math.round(performance.now() - startTime);

  // Status mapping logic strictly conforming to prompt:
  // 1. "If Garena returns HTTP 403, display the CAPTCHA-required status."
  // 2. "Do not claim OTP was sent unless the API confirms success."
  // Statuses: 'Waiting for Verification' | 'CAPTCHA Required' | 'Verification Completed' | 'OTP Request Submitted' | 'Request Failed' | 'Rate Limited'
  let statusType: DebugRecord['statusType'] = 'waiting_for_verification';
  let statusMessage = 'Waiting for Verification';
  let captchaRequired = false;
  let captchaUrl: string | undefined = undefined;

  if (garenaStatus === 403) {
    captchaRequired = true;
    statusType = 'captcha_required';
    statusMessage = 'CAPTCHA Required';
    // DataDome challenge returns { url: "https://geo.captcha-delivery.com/..." }
    if (parsedJson && typeof parsedJson.url === 'string') {
      captchaUrl = parsedJson.url;
    }
    errorMessage = 'Garena security protection requires official browser CAPTCHA verification.';
  } else if (garenaStatus === 429) {
    statusType = 'rate_limited';
    statusMessage = 'Rate Limited';
    errorMessage = 'Too many requests sent to Garena registration API.';
  } else if (garenaStatus === 200) {
    if (parsedJson && (parsedJson.result === 0 || parsedJson.error === 0 || parsedJson.success === true || parsedJson.error === 'error_none' || (!parsedJson.error && !parsedJson.code && parsedJson.result !== undefined))) {
      statusType = 'otp_submitted';
      statusMessage = 'OTP Request Submitted';
    } else if (parsedJson && (parsedJson.error === 'error_captcha' || parsedJson.error === 'error_require_captcha')) {
      captchaRequired = true;
      statusType = 'captcha_required';
      statusMessage = 'CAPTCHA Required';
      if (parsedJson.url) captchaUrl = parsedJson.url;
    } else {
      statusType = 'request_failed';
      const errCode = parsedJson?.error || parsedJson?.code || '';
      if (errCode === 'error_user_exist') {
        errorMessage = 'Username already exists. Please choose a different username.';
      } else if (errCode === 'error_email_exist') {
        errorMessage = 'Email already registered. Try another email address.';
      } else if (errCode === 'error_params') {
        errorMessage = 'Invalid username or email format sent to Garena.';
      } else if (errCode === 'error_too_many_requests' || errCode === 1006) {
        statusType = 'rate_limited';
        statusMessage = 'Rate Limited';
        errorMessage = 'Garena rate limit reached. Please wait a minute.';
      } else {
        errorMessage = parsedJson?.msg || parsedJson?.error || 'Garena returned an unexpected error response.';
      }
      statusMessage = errorMessage || 'Request Failed';
    }
  } else {
    statusType = 'request_failed';
    statusMessage = 'Request Failed';
    if (!errorMessage) {
      errorMessage = `Server returned HTTP ${garenaStatus} ${garenaStatusText}`;
    }
  }

  const record: DebugRecord = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    durationMs,
    httpStatus: garenaStatus,
    httpStatusText: garenaStatusText,
    statusType,
    statusMessage,
    captchaRequired,
    captchaUrl,
    requestPayload: {
      username: cleanUsername,
      email: cleanEmail,
      locale: cleanLocale,
      format: 'json',
      timestampId
    },
    responseHeaders,
    responseBody: parsedJson,
    errorMessage
  };

  debugHistory.unshift(record);
  if (debugHistory.length > 25) debugHistory.pop();

  res.status(garenaStatus >= 400 && garenaStatus < 500 ? 200 : garenaStatus >= 500 ? 500 : 200).json(record);
});

// -------------------------------------------------------------
// Vite Dev Server / Static Build Mounting
// -------------------------------------------------------------
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Garena Verification Server] Running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
