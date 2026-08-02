import React from 'react';
import { useSandbox } from '../../hooks/useSandbox';
import { EndpointSelector } from './EndpointSelector';
import { RequestBuilder } from './RequestBuilder';
import { ResponseViewer } from './ResponseViewer';
import { MetricsCard } from './MetricsCard';
import { RequestHistory } from './RequestHistory';
import { Terminal, Zap, Shield, Sparkles } from 'lucide-react';

export const SDKSandbox: React.FC = () => {
  const {
    endpoint,
    setEndpoint,
    language,
    setLanguage,
    config,
    updateConfig,
    response,
    loading,
    errorCard,
    history,
    executeRequest,
    restoreFromHistory,
    resetForm,
    clearResponse,
    clearHistory
  } = useSandbox();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Sandbox Header Banner */}
      <div className="glass-card-premium p-6 rounded-3xl border border-white/12 relative overflow-hidden glass-reflection">
        <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-mono font-bold">
              <Zap size={14} className="text-indigo-400 animate-pulse" />
              <span>Live Cloudflare API Testing Ground</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Interactive SDK Sandbox
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Test live authentication, key registration, remote variables, and HWID locks directly against the production Cloudflare Worker API. Real requests with Web Crypto RSA-SHA256 signature verification.
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-4 py-2 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-slate-300 font-bold">Worker Engine:</span>
              <span className="text-emerald-400 font-mono">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Endpoint Selector Grid */}
      <div className="glass-card p-5 rounded-3xl space-y-4">
        <EndpointSelector selectedEndpoint={endpoint} onSelectEndpoint={setEndpoint} />
      </div>

      {/* Split Responsive Playground Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Request Parameter Builder */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Terminal size={16} className="text-indigo-400" />
                <span>Request Parameters</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                Client Payload
              </span>
            </div>

            <RequestBuilder
              endpoint={endpoint}
              config={config}
              onChangeConfig={updateConfig}
              onExecute={executeRequest}
              loading={loading}
              onReset={resetForm}
            />
          </div>
        </div>

        {/* Right Panel: Response & Code Viewer */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-purple-400" />
                <span>Live Response & Code Generator</span>
              </h3>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                Production Sandbox
              </span>
            </div>

            <ResponseViewer
              response={response}
              errorCard={errorCard}
              endpoint={endpoint}
              config={config}
              language={language}
              onSelectLanguage={setLanguage}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Bottom Metrics Bar */}
      {response?.metrics && (
        <div className="glass-card p-4 rounded-3xl">
          <MetricsCard metrics={response.metrics} />
        </div>
      )}

      {/* Request History Section */}
      <div className="glass-card p-5 rounded-3xl">
        <RequestHistory
          history={history}
          onSelectHistory={restoreFromHistory}
          onClearHistory={clearHistory}
        />
      </div>
    </div>
  );
};
