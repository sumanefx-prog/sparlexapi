import React, { useState } from 'react';
import { DebugRecord } from '../types';
import { 
  Code2, 
  Copy, 
  Check, 
  Terminal, 
  ListFilter, 
  FileJson, 
  History, 
  Clock, 
  ShieldAlert, 
  Trash2, 
  Info,
  CheckCircle2
} from 'lucide-react';

interface AdminDebugPanelProps {
  currentRecord: DebugRecord | null;
  history: DebugRecord[];
  onSelectRecord: (record: DebugRecord) => void;
  onClearHistory: () => void;
}

export const AdminDebugPanel: React.FC<AdminDebugPanelProps> = ({
  currentRecord,
  history,
  onSelectRecord,
  onClearHistory
}) => {
  const [activeTab, setActiveTab] = useState<'response' | 'headers' | 'payload' | 'history'>('response');
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const handleCopyResponse = () => {
    if (!currentRecord) return;
    const content = JSON.stringify(currentRecord.responseBody, null, 2);
    navigator.clipboard.writeText(content);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-emerald-400 bg-emerald-950/80 border-emerald-800/80';
    if (status === 403) return 'text-red-400 bg-red-950/80 border-red-800/80';
    if (status === 429) return 'text-purple-400 bg-purple-950/80 border-purple-800/80';
    if (status >= 400 && status < 500) return 'text-amber-400 bg-amber-950/80 border-amber-800/80';
    return 'text-rose-400 bg-rose-950/80 border-rose-800/80';
  };

  // Generate Python snippet matching user's provided code
  const getPythonSnippet = () => {
    if (!currentRecord) return '';
    const { username, email, locale, timestampId } = currentRecord.requestPayload;
    return `import requests
import time

url = "https://auth.garena.com/api/send_register_code_email"

data = {
    "username": "${username}",
    "email": "${email}",
    "locale": "${locale}",
    "format": "json",
    "id": "${timestampId}"
}

headers = {
    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    "Accept": "application/json",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

response = requests.post(
    url,
    data=data,
    headers=headers,
    timeout=30
)

print("Status:", response.status_code)
print("Response:", response.text)
`;
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(getPythonSnippet());
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="bg-[#0E1424] border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
      
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-red-950/50 border border-red-900/50 text-red-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <span>Admin Debug Panel</span>
              <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Live Telemetry
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              HTTP inspect, sanitized response headers, payload and response capture
            </p>
          </div>
        </div>

        {/* Action button */}
        {currentRecord && (
          <button
            onClick={handleCopyResponse}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
          >
            {copiedResponse ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied JSON!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Response</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Primary KPI Strip (HTTP Status, Duration, Timestamp, CAPTCHA Required) */}
      {currentRecord ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 bg-slate-950/60 border-b border-slate-800/80 text-xs">
          
          {/* 1. HTTP Status */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              HTTP Status Code
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded border ${getStatusColor(currentRecord.httpStatus)}`}>
                {currentRecord.httpStatus}
              </span>
              <span className="text-slate-300 font-medium truncate">
                {currentRecord.httpStatusText}
              </span>
            </div>
          </div>

          {/* 2. Duration */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Request Duration
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono font-bold text-sm text-slate-100 tabular-nums">
                {currentRecord.durationMs} ms
              </span>
            </div>
          </div>

          {/* 3. CAPTCHA Status */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              CAPTCHA Required
            </div>
            <div className="flex items-center gap-1.5">
              {currentRecord.captchaRequired ? (
                <span className="inline-flex items-center gap-1 text-red-400 font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                  <span>Yes (Active)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>None</span>
                </span>
              )}
            </div>
          </div>

          {/* 4. Timestamp */}
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Request Timestamp
            </div>
            <div className="font-mono text-[11px] text-slate-300 truncate" title={currentRecord.timestamp}>
              {new Date(currentRecord.timestamp).toLocaleTimeString()}
            </div>
          </div>

        </div>
      ) : (
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <span>Awaiting first request dispatch. Submit the registration form to capture live response telemetry.</span>
        </div>
      )}

      {/* Tabs navigation */}
      <div className="flex items-center gap-1 px-4 pt-3 border-b border-slate-800 bg-slate-900/30 overflow-x-auto">
        <button
          onClick={() => setActiveTab('response')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'response'
              ? 'border-red-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileJson className="w-3.5 h-3.5" />
          <span>Response JSON</span>
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'headers'
              ? 'border-red-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5" />
          <span>Headers ({currentRecord ? Object.keys(currentRecord.responseHeaders).length : 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('payload')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'payload'
              ? 'border-red-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Python & Curl</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ml-auto cursor-pointer ${
            activeTab === 'history'
              ? 'border-red-500 text-white font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History ({history.length})</span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="p-4 sm:p-5 flex-1 overflow-y-auto max-h-[380px] bg-[#0A0D15]">
        
        {/* TAB 1: Response JSON */}
        {activeTab === 'response' && (
          <div>
            {currentRecord?.errorMessage && (
              <div className="mb-3 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-xs text-red-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-red-200">Notice:</span> {currentRecord.errorMessage}
                </div>
              </div>
            )}

            {currentRecord ? (
              <pre className="font-mono text-xs text-emerald-300/90 bg-[#06080E] p-4 rounded-xl border border-slate-800/90 overflow-x-auto leading-relaxed shadow-inner">
                {JSON.stringify(currentRecord.responseBody, null, 2)}
              </pre>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No active response captured yet.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Headers */}
        {activeTab === 'headers' && (
          <div>
            {currentRecord && Object.keys(currentRecord.responseHeaders).length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#06080E]">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-900/60 font-sans">
                      <th className="py-2.5 px-4 font-semibold">Header Name</th>
                      <th className="py-2.5 px-4 font-semibold">Header Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {Object.entries(currentRecord.responseHeaders).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-2 px-4 text-red-400 font-semibold whitespace-nowrap align-top">
                          {key}
                        </td>
                        <td className="py-2 px-4 text-slate-300 break-all">
                          {val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No response headers available yet.
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-2.5 italic">
              Note: Sensitive cookies (such as Set-Cookie) are scrubbed at backend to prevent private credential exposure.
            </p>
          </div>
        )}

        {/* TAB 3: Python & Curl */}
        {activeTab === 'payload' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Python requests script (Matching user prompt)</span>
              <button
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSnippet ? 'Copied!' : 'Copy Python'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-sky-300/90 bg-[#06080E] p-4 rounded-xl border border-slate-800 overflow-x-auto leading-relaxed">
              {getPythonSnippet() || '# Dispatch a request to generate reproduction snippet'}
            </pre>
          </div>
        )}

        {/* TAB 4: Request History */}
        {activeTab === 'history' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-slate-400">Past requests in this session</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="inline-flex items-center gap-1 text-[11px] text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                History is currently empty.
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => onSelectRecord(record)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      currentRecord?.id === record.id
                        ? 'bg-slate-800/80 border-red-500/50'
                        : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getStatusColor(record.httpStatus)}`}>
                        {record.httpStatus}
                      </span>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {record.requestPayload.username} ({record.requestPayload.locale})
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px] sm:max-w-[280px]">
                          {record.requestPayload.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[11px] font-mono text-slate-300 tabular-nums">
                        {record.durationMs}ms
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
