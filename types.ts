
export interface Customer {
  email: string;
  secret: string;
  plan: string;
  credits: number;
  createdAt: string;
  discordId?: string;
  messageCount?: number;
  lastDaily?: string;
  lastWeekly?: string;
  boostsClaimed?: number;
  lastBoostClaim?: string;
  totalEarned?: number;
  consecutiveDays?: number;
  lastActiveDate?: string;
}

export interface SDK {
  id: string;
  name: string;
  language: string; // e.g. 'python' | 'csharp' | 'cpp' | 'java' | 'rust' | 'go' | 'typescript'
  icon?: string;
  githubUrl: string;
  sdkCode: string;
  displayOrder: number;
  visible: boolean;
  badge?: 'Stable' | 'Beta' | 'Experimental' | 'Coming Soon' | string;
  version?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  link?: string; // legacy fallback
}

export interface Reseller {
  username: string;
  passwordHash: string;
  hash: string;
  allowedApps: string[];
  userLimit: number;
  createdBy: string;
  createdAt: string;
  usersCreated: number;
  licensesCreated: number;
  panelName?: string;
}

export interface FeatureRestriction {
  featureId: string;
  requiredPlan: string;
  displayName: string;
}

export interface SystemConfig {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maintenanceStatus?: string;
  sdks?: Record<string, SDK>;
  featureRestrictions?: Record<string, FeatureRestriction>;
}

export interface AppMetadata {
  created: string;
  version: string;
  applicationPaused: boolean;
}

export interface User {
  username?: string;
  password?: string;
  expiry: string | 'lifetime';
  isBanned: boolean;
  hwidLock: boolean;
  sid: string;
  oneTime: boolean;
  created: string;
  license?: string;
  createdBy?: string;
}

export interface License {
  expiry: string | 'lifetime';
  displayName: string;
  used: boolean;
  created: string;
  associatedUser?: string;
  createdBy?: string;
}

export interface WebhookSettings {
  url: string;
  notifyLogin: boolean;
  notifyAddUser: boolean;
  notifyDeleteUser: boolean;
  notifyAddLicense: boolean;
  notifyExpireLicense: boolean;
  notifyPauseApp: boolean;
}

export interface SystemPlan {
  maxApps: number;
  maxUsers: number;
  onSale: boolean;
  creditPrice: number;
  price: string;
  order: number;
  features?: string[];
}
