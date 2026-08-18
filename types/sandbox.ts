export type SandboxLanguage = 'python' | 'csharp' | 'cpp' | 'rust' | 'go' | 'typescript';

export type SandboxEndpointPath = 
  | '/login'
  | '/register'
  | '/versioncheck'
  | '/getvariable'
  | '/getvariables'
  | '/isapplicationpaused';

export type ExportFormat = 'curl' | 'python' | 'csharp' | 'javascript' | 'postman' | 'json';

export interface SandboxEndpointInfo {
  path: SandboxEndpointPath;
  name: string;
  description: string;
  requiredFields: string[];
}

export interface SandboxRequestConfig {
  secret: string;
  app: string;
  username: string;
  password: string;
  licenseKey?: string;
  authMode?: 'credentials' | 'license';
  hwid: string;
  version: string;
  varName: string;
  clientTimestamp: number;
  clientNonce: string;
  autoTimestamp: boolean;
  autoNonce: boolean;
  devMode: boolean;
}

export interface SandboxMetrics {
  latencyMs: number;
  responseTimeMs: number;
  httpStatus: number;
  statusText: string;
  payloadSizeKb: number;
  endpoint: string;
  timestamp: string;
}

export interface SignatureVerificationResult {
  hasSignature: boolean;
  verified: boolean;
  durationMs: number;
  rawSignature?: string;
  error?: string;
}

export interface SandboxResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  rawText: string;
  metrics: SandboxMetrics;
  verification?: SignatureVerificationResult;
}

export interface RequestHistoryItem {
  id: string;
  timestamp: string;
  endpoint: SandboxEndpointPath;
  config: SandboxRequestConfig;
  status: number;
  statusText: string;
  latencyMs: number;
  success: boolean;
}

export interface SandboxErrorCard {
  type: string;
  title: string;
  description: string;
  code: number | string;
  recommendation: string;
}
