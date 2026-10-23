import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  SandboxResponseData,
  SandboxErrorCard,
  SandboxLanguage,
  ExportFormat,
  SandboxEndpointPath,
  SandboxRequestConfig
} from '../../types/sandbox';
import { SignatureStatus } from './SignatureStatus';
import { generateCodeSnippet, generateExportPayload } from '../../services/sandboxService';
import { LanguageSelector } from './LanguageSelector';
import {
  Copy, Check, Download, Code2, Terminal, FileCode,
  AlertTriangle, Share2, Sparkles, Layers, RefreshCcw
} from 'lucide-react';

interface ResponseViewerProps {
  response: SandboxResponseData | null;
  errorCard: SandboxErrorCard | null;
  endpoint: SandboxEndpointPath;
  config: SandboxRequestConfig;
  language: SandboxLanguage;
  onSelectLanguage: (lang: SandboxLanguage) => void;
  loading: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = React.memo(({
  response,
  errorCard,
  endpoint,
  config,
  language,
  onSelectLanguage,
  loading
}) => {
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isRaw, setIsRaw] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('curl');

  const formattedResponseText = response
    ? (isRaw ? response.rawText : JSON.stringify(response.body, null, 2))
    : '// Run a request to view live API response';

  const generatedCode = generateCodeSnippet(language, endpoint, config);
  const exportedPayload = generateExportPayload(exportFormat, endpoint, config);

  const handleCopyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(formattedResponseText);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadJson = () => {
    if (!response) return;
    const blob = new Blob([formattedResponseText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notexe_${endpoint.replace('/', '')}_response.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 flex flex-col h-full">
      {/* Top Controls Bar */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <SignatureStatus verification={response?.verification} />
          {response && (
            <span
              className={`text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg border ${
                response.status === 200
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {response.status} {response.statusText}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {response && (
            <>
              <button
                type="button"
                onClick={() => setIsRaw(!isRaw)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all border ${
                  isRaw
                    ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {isRaw ? 'Raw View' : 'Pretty JSON'}
              </button>

              <button
                type="button"
                onClick={handleCopyResponse}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Copy Response"
              >
                {copiedResponse ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span className="hidden sm:inline">{copiedResponse ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJson}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Download JSON"
              >
                <Download size={14} />
                <span className="hidden sm:inline">JSON</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Error Card Display */}
      {errorCard && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <AlertTriangle size={18} />
              <span>{errorCard.title}</span>
            </div>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
              {errorCard.code}
            </span>
          </div>
          <p className="text-xs text-rose-200/90 leading-relaxed">
            {errorCard.description}
          </p>
          <div className="text-[11px] text-rose-300/80 font-mono pt-1">
            💡 <strong>Recommendation:</strong> {errorCard.recommendation}
          </div>
        </div>
      )}

      {/* Response Monaco / Code Container */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#1e1e1e] shadow-2xl relative min-h-[220px] flex-1">
        {loading && (
          <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-sm flex items-center justify-center gap-3 text-indigo-300 font-mono text-xs">
            <RefreshCcw size={20} className="animate-spin text-indigo-400" />
            <span>Fetching Live Worker API Response...</span>
          </div>
        )}
        <Editor
          height="220px"
          language="json"
          theme="vs-dark"
          value={formattedResponseText}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on'
          }}
        />
      </div>

      {/* Code Generation Section */}
      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Code2 size={16} className="text-indigo-400" />
            <span>Client Code Snippet Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as ExportFormat)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs text-slate-300 font-mono focus:outline-none"
            >
              <option value="curl">cURL Command</option>
              <option value="python">Python Requests</option>
              <option value="csharp">C# HttpClient</option>
              <option value="javascript">JS fetch</option>
              <option value="postman">Postman Collection v2.1</option>
              <option value="json">Raw JSON</option>
            </select>
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{copiedCode ? 'Copied Snippet' : 'Copy Code'}</span>
            </button>
          </div>
        </div>

        <LanguageSelector selectedLanguage={language} onSelectLanguage={onSelectLanguage} />

        <div className="border border-white/10 rounded-xl overflow-hidden bg-[#1e1e1e] shadow-inner h-40">
          <Editor
            height="100%"
            language={language === 'csharp' ? 'csharp' : language === 'cpp' ? 'cpp' : language}
            theme="vs-dark"
            value={generatedCode}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 11,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true
            }}
          />
        </div>
      </div>
    </div>
  );
});

ResponseViewer.displayName = 'ResponseViewer';
