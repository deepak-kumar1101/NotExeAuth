
export type BillingCycle = 'monthly' | 'yearly';
export type SubscriptionStatus = 'trial' | 'active' | 'renewing' | 'grace_period' | 'expired' | 'downgraded' | 'cancelled' | 'suspended';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  read: boolean;
}

export interface SubscriptionLifecycleEvent {
  id: string;
  timestamp: string;
  userEmail: string;
  userSecret?: string;
  oldPlan: string;
  newPlan: string;
  oldState: SubscriptionStatus;
  newState: SubscriptionStatus;
  reason: string;
  source: 'system' | 'user' | 'admin';
}

export interface CreditTopUpRequest {
  id: string;
  userEmail: string;
  userSecret?: string;
  creditsRequested: number;
  priceINR: number;
  selectedPackage: string;
  note?: string;
  screenshotBase64?: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
}

export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  priceINR: number;
  popular?: boolean;
  recommendedFor?: string;
  badge?: string;
  order: number;
}

export interface PaymentConfig {
  upiId: string;
  qrImageUrl?: string;
  customInstructions?: string;
  discordUrl?: string;
  instagramUrl?: string;
}

export interface SubscriptionHistoryItem {
  plan: string;
  billingCycle: BillingCycle;
  purchasePrice: number;
  activatedAt: number;
  expiresAt: number | null;
  status: SubscriptionStatus;
  type: 'purchase' | 'renewal' | 'downgrade' | 'upgrade' | 'grace' | 'admin_override';
}

export interface SubscriptionRecord {
  plan: string;
  billingCycle: BillingCycle;
  purchasePrice: number;
  activatedAt: number;
  expiresAt: number | null; // null for Free lifetime plan
  graceExpiresAt?: number | null;
  status: SubscriptionStatus;
  autoDowngrade: boolean;
}

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
  subscription?: SubscriptionRecord;
  subscriptionHistory?: SubscriptionHistoryItem[];
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

export type PlanVisibility = 'Public' | 'Hidden' | 'Beta' | 'Coming Soon' | 'Deprecated' | 'Archived';

export interface PlanAuditLog {
  id: string;
  planName: string;
  action: 'create' | 'update' | 'delete' | 'duplicate' | 'reorder';
  performedBy: string;
  timestamp: string;
  changesSummary: string;
}

export interface SystemPlan {
  maxApps: number;
  maxUsers: number;
  onSale: boolean;
  creditPrice: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  price: string;
  order: number;
  features?: string[];
  
  // Extended Infrastructure Panel Attributes
  description?: string;
  shortDescription?: string;
  icon?: string;
  accentColor?: string;
  badge?: string;
  publicName?: string;
  internalId?: string;
  
  // Extended Quota Limits (-1 = Unlimited)
  maxVariables?: number;
  maxCloudVars?: number;
  maxWebhooks?: number;
  maxResellers?: number;
  maxDownloads?: number;
  maxSessions?: number;
  maxApiRequests?: number;
  
  // Extended Visibility & Badging
  visibility?: PlanVisibility;
  
  // Advanced Infrastructure Controls
  autoDowngrade?: boolean;
  subscriptionRequired?: boolean;
  defaultPlan?: boolean;
  recommendedPlan?: boolean;
  highlightCard?: boolean;
}


