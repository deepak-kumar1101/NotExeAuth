export type AuditSeverity = 'Info' | 'Success' | 'Warning' | 'Critical';

export type AuditActorType = 'admin' | 'developer' | 'reseller' | 'user' | 'system' | 'worker';

export type AuditCategory =
  | 'Authentication'
  | 'Application'
  | 'User'
  | 'License'
  | 'Subscription'
  | 'Credit'
  | 'Variable'
  | 'Webhook'
  | 'Reseller'
  | 'Admin'
  | 'Security';

export type AuditEventType =
  // Authentication
  | 'USER_LOGIN'
  | 'FAILED_LOGIN'
  | 'SECRET_LOGIN'
  | 'LOGOUT'
  | 'PASSWORD_RESET'
  | 'ACCOUNT_CREATED'
  | 'ACCOUNT_DELETED'

  // Application Events
  | 'APP_CREATED'
  | 'APP_DELETED'
  | 'APP_PAUSED'
  | 'APP_RESUMED'
  | 'VERSION_UPDATED'

  // User Events
  | 'USER_CREATED'
  | 'USER_DELETED'
  | 'HWID_RESET'
  | 'HWID_BOUND'
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'PASSWORD_CHANGED'

  // License Events
  | 'LICENSE_CREATED'
  | 'LICENSE_DELETED'
  | 'LICENSE_ACTIVATED'
  | 'LICENSE_EXPIRED'
  | 'LICENSE_REDEEMED'

  // Subscription Events
  | 'PLAN_PURCHASED'
  | 'PLAN_RENEWED'
  | 'PLAN_UPGRADED'
  | 'PLAN_DOWNGRADED'
  | 'SUBSCRIPTION_EXPIRED'
  | 'GRACE_PERIOD_STARTED'
  | 'GRACE_PERIOD_ENDED'

  // Credits
  | 'CREDITS_ADDED'
  | 'CREDITS_SPENT'
  | 'CREDITS_REFUNDED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED'

  // Variables
  | 'VARIABLE_CREATED'
  | 'VARIABLE_UPDATED'
  | 'VARIABLE_DELETED'

  // Webhooks
  | 'WEBHOOK_ADDED'
  | 'WEBHOOK_REMOVED'
  | 'WEBHOOK_TRIGGERED'

  // Resellers
  | 'RESELLER_CREATED'
  | 'RESELLER_UPDATED'
  | 'RESELLER_DELETED'
  | 'QUOTA_CHANGED'

  // Admin
  | 'MAINTENANCE_ENABLED'
  | 'MAINTENANCE_DISABLED'
  | 'PAYMENT_CONFIG_UPDATED'
  | 'PLAN_EDITED'
  | 'PLAN_CREATED'
  | 'PLAN_DELETED'

  // Security
  | 'REPLAY_ATTACK_BLOCKED'
  | 'RATE_LIMIT_TRIGGERED'
  | 'HWID_MISMATCH'
  | 'VERSION_MISMATCH'
  | 'PAUSED_APP_ACCESS_ATTEMPT'
  | 'INVALID_SIGNATURE'
  | 'WORKER_ERROR';

export interface AuditLogItem {
  eventId: string;
  timestamp: string; // ISO 8601 string
  type: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  actorType: AuditActorType;
  actorEmail?: string;
  actorSecret?: string;
  application?: string;
  username?: string;
  licenseKey?: string;
  ip?: string;
  country?: string;
  device?: string;
  os?: string;
  hwid?: string;
  description: string;
  metadata?: Record<string, any>;
  previousValue?: any;
  newValue?: any;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'BLOCKED';
}

export interface AuditFilterState {
  dateRange: 'all' | 'today' | 'yesterday' | '7days' | '30days';
  category: AuditCategory | 'all';
  severity: AuditSeverity | 'all';
  actorType: AuditActorType | 'all';
  application: string;
  searchQuery: string;
}
