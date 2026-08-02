import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SandboxEndpointPath,
  SandboxLanguage,
  SandboxRequestConfig,
  SandboxResponseData,
  RequestHistoryItem,
  SandboxErrorCard
} from '../types/sandbox';
import { executeWorkerRequest, diagnoseError, SANDBOX_ENDPOINTS } from '../services/sandboxService';

const DEFAULT_CONFIG: SandboxRequestConfig = {
  secret: '',
  app: 'MyApplication',
  username: 'demo_user',
  password: 'demo_password123',
  hwid: 'HWID-8821-X992-ALPHA',
  version: '1.0.0',
  varName: 'API_SECRET_KEY',
  clientTimestamp: Date.now(),
  clientNonce: Math.random().toString(36).substring(2, 12),
  autoTimestamp: true,
  autoNonce: true,
  devMode: false
};

const LOCAL_STORAGE_CONFIG_KEY = 'dxa_sandbox_last_config';
const LOCAL_STORAGE_HISTORY_KEY = 'dxa_sandbox_history';

export function useSandbox() {
  const [endpoint, setEndpoint] = useState<SandboxEndpointPath>('/login');
  const [language, setLanguage] = useState<SandboxLanguage>('python');
  const [config, setConfig] = useState<SandboxRequestConfig>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_CONFIG;
  });

  const [response, setResponse] = useState<SandboxResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorCard, setErrorCard] = useState<SandboxErrorCard | null>(null);

  const [history, setHistory] = useState<RequestHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-save config changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
    } catch (e) {}
  }, [config]);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  const updateConfig = useCallback((update: Partial<SandboxRequestConfig>) => {
    setConfig(prev => ({ ...prev, ...update }));
  }, []);

  const executeRequest = useCallback(async () => {
    // Abort previous inflight request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErrorCard(null);

    const activeConfig: SandboxRequestConfig = {
      ...config,
      clientTimestamp: config.autoTimestamp ? Date.now() : config.clientTimestamp,
      clientNonce: config.autoNonce ? Math.random().toString(36).substring(2, 12) : config.clientNonce
    };

    setConfig(activeConfig);

    try {
      const resp = await executeWorkerRequest(endpoint, activeConfig, controller.signal);
      setResponse(resp);

      const diag = diagnoseError(resp.status, resp.body);
      setErrorCard(diag);

      // Create history item
      const historyItem: RequestHistoryItem = {
        id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        endpoint,
        config: activeConfig,
        status: resp.status,
        statusText: resp.statusText,
        latencyMs: resp.metrics.latencyMs,
        success: resp.status === 200 && resp.body?.success !== false
      };

      setHistory(prev => [historyItem, ...prev.slice(0, 19)]);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorCard({
          type: 'Execution Failed',
          title: 'Request Failed',
          description: err.message || 'Execution error occurred',
          code: 500,
          recommendation: 'Check network connectivity or backend availability.'
        });
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, config]);

  const restoreFromHistory = useCallback((item: RequestHistoryItem) => {
    setEndpoint(item.endpoint);
    setConfig(item.config);
  }, []);

  const resetForm = useCallback(() => {
    setConfig(DEFAULT_CONFIG);
    setResponse(null);
    setErrorCard(null);
  }, []);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setErrorCard(null);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch (e) {}
  }, []);

  return {
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
    clearHistory,
    endpoints: SANDBOX_ENDPOINTS
  };
}
