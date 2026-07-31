import { ref, set, get } from 'firebase/database';
import { db } from './firebase';
import { encrypt, decrypt } from './encryption';
import { Customer, BillingCycle, SubscriptionRecord, SubscriptionHistoryItem, SubscriptionStatus, SubscriptionLifecycleEvent, InAppNotification, SystemPlan } from '../types';

// CONFIGURABLE LIFECYCLE DURATION CONSTANTS
export class SubscriptionConfig {
  static readonly MONTHLY_DAYS = 30;
  static readonly YEARLY_DAYS = 365;
  static readonly MONTHLY_MS = 30 * 24 * 60 * 60 * 1000;
  static readonly YEARLY_MS = 365 * 24 * 60 * 60 * 1000;
  static readonly GRACE_PERIOD_DAYS = 7;
  static readonly GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;
  static readonly RENEWAL_WARNING_DAYS = 7;
}

/**
 * Immutable Lifecycle Event Logger (`/system/subscriptionEvents`)
 */
export const logSubscriptionEvent = async (
  userEmail: string,
  userSecret: string | undefined,
  oldPlan: string,
  newPlan: string,
  oldState: SubscriptionStatus,
  newState: SubscriptionStatus,
  reason: string,
  source: 'system' | 'user' | 'admin' = 'system'
) => {
  try {
    const eventId = `sub_evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventPayload: SubscriptionLifecycleEvent = {
      id: eventId,
      timestamp: new Date().toISOString(),
      userEmail,
      userSecret: userSecret || '',
      oldPlan,
      newPlan,
      oldState,
      newState,
      reason,
      source
    };
    await set(ref(db, `system/subscriptionEvents/${eventId}`), encrypt(eventPayload));
  } catch (e) {
    console.warn("Subscription lifecycle event log error (non-fatal):", e);
  }
};

/**
 * Dispatches In-App Notification to Customer (`/customers/${emailKey}/notifications`)
 */
export const sendInAppNotification = async (
  userEmail: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success' = 'info'
) => {
  try {
    const emailKey = userEmail.replace(/\./g, ',');
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const notifPayload: InAppNotification = {
      id: notifId,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    await set(ref(db, `customerNotifications/${emailKey}/${notifId}`), encrypt(notifPayload));
  } catch (e) {
    console.warn("In-app notification error:", e);
  }
};

/**
 * Calculates yearly savings percentage automatically
 */
export const calculateYearlySavings = (monthlyPrice: number = 0, yearlyPrice: number = 0) => {
  if (!monthlyPrice || !yearlyPrice) return { savingsCredits: 0, savingsPercent: 0 };
  const annualMonthlyTotal = monthlyPrice * 12;
  const savingsCredits = annualMonthlyTotal - yearlyPrice;
  if (savingsCredits <= 0) return { savingsCredits: 0, savingsPercent: 0 };
  const savingsPercent = Math.round((savingsCredits / annualMonthlyTotal) * 100);
  return { savingsCredits, savingsPercent };
};

/**
 * Calculates remaining days, hours, and formatted date for a subscription
 */
export const getSubscriptionCountdown = (expiresAt: number | null | undefined, graceExpiresAt?: number | null) => {
  if (!expiresAt) {
    return {
      daysLeft: 0,
      hoursLeft: 0,
      isExpired: false,
      isGracePeriod: false,
      isExpiringSoon: false,
      formattedExpiry: 'Lifetime / Permanent'
    };
  }

  const now = Date.now();
  const diffMs = expiresAt - now;

  if (diffMs <= 0) {
    if (graceExpiresAt && now <= graceExpiresAt) {
      const graceDiffMs = graceExpiresAt - now;
      const graceDaysLeft = Math.ceil(graceDiffMs / (1000 * 60 * 60 * 24));
      return {
        daysLeft: graceDaysLeft,
        hoursLeft: Math.ceil(graceDiffMs / (1000 * 60 * 60)),
        isExpired: false,
        isGracePeriod: true,
        isExpiringSoon: true,
        formattedExpiry: `Grace Period (${graceDaysLeft} Days Remaining)`
      };
    }

    return {
      daysLeft: 0,
      hoursLeft: 0,
      isExpired: true,
      isGracePeriod: false,
      isExpiringSoon: false,
      formattedExpiry: 'Expired'
    };
  }

  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil(diffMs / (1000 * 60 * 60));
  const isExpiringSoon = daysLeft <= SubscriptionConfig.RENEWAL_WARNING_DAYS;
  const expiryDateObj = new Date(expiresAt);
  const formattedExpiry = expiryDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return {
    daysLeft,
    hoursLeft,
    isExpired: false,
    isGracePeriod: false,
    isExpiringSoon,
    formattedExpiry
  };
};

/**
 * Central Lifecycle Engine Evaluator & Auto-Downgrade System
 */
export const evaluateSubscriptionLifecycle = async (customer: Customer | null): Promise<{
  updatedCustomer: Customer | null;
  stateChanged: boolean;
  message?: string;
}> => {
  if (!customer || !customer.email) return { updatedCustomer: customer, stateChanged: false };

  // Free lifetime plan never expires
  if (customer.plan === 'Free Plan' || !customer.subscription?.expiresAt) {
    return { updatedCustomer: customer, stateChanged: false };
  }

  const now = Date.now();
  const sub = customer.subscription;
  const emailKey = customer.email.replace(/\./g, ',');

  // Check if suspended by admin
  if (sub.status === 'suspended') {
    return { updatedCustomer: customer, stateChanged: false, message: 'Subscription is suspended.' };
  }

  // Check Expiry
  if (now >= sub.expiresAt) {
    const graceExpiresAt = sub.graceExpiresAt || (sub.expiresAt + SubscriptionConfig.GRACE_PERIOD_MS);

    // Stage 1: Grace Period Engine
    if (now <= graceExpiresAt && sub.status !== 'grace_period') {
      const graceSub: SubscriptionRecord = {
        ...sub,
        status: 'grace_period',
        graceExpiresAt
      };
      const updatedCustomer: Customer = {
        ...customer,
        subscription: graceSub
      };

      await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
      await logSubscriptionEvent(customer.email, customer.secret, customer.plan, customer.plan, sub.status, 'grace_period', 'Subscription expired; 7-day grace period initiated', 'system');
      await sendInAppNotification(customer.email, 'Grace Period Active', 'Your subscription has expired. You are now in a 7-day grace period. Please renew to keep full access.', 'warning');
      
      return {
        updatedCustomer,
        stateChanged: true,
        message: 'Subscription expired. Entered 7-day grace period.'
      };
    }

    // Stage 2: Automatic Downgrade Engine (Past Grace Period)
    if (now > graceExpiresAt && sub.status !== 'downgraded') {
      const downgradeHistory: SubscriptionHistoryItem = {
        plan: customer.plan,
        billingCycle: sub.billingCycle || 'monthly',
        purchasePrice: sub.purchasePrice || 0,
        activatedAt: sub.activatedAt || now,
        expiresAt: sub.expiresAt,
        status: 'downgraded',
        type: 'downgrade'
      };

      const updatedCustomer: Customer = {
        ...customer,
        plan: 'Free Plan',
        subscription: {
          plan: 'Free Plan',
          billingCycle: 'monthly',
          purchasePrice: 0,
          activatedAt: now,
          expiresAt: null,
          status: 'downgraded',
          autoDowngrade: true
        },
        subscriptionHistory: [...(customer.subscriptionHistory || []), downgradeHistory]
      };

      await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
      await logSubscriptionEvent(customer.email, customer.secret, customer.plan, 'Free Plan', sub.status, 'downgraded', 'Subscription and grace period completed; auto-downgraded to Free Plan', 'system');
      await sendInAppNotification(customer.email, 'Infrastructure Downgraded', 'Your subscription expired and passed grace period. Your account has returned to Free Plan.', 'error');

      return {
        updatedCustomer,
        stateChanged: true,
        message: 'Infrastructure Downgraded: Subscription Expired. Returned to Free Plan.'
      };
    }
  }

  return { updatedCustomer: customer, stateChanged: false };
};

/**
 * Backward compatibility alias for checkAndDowngradeIfExpired
 */
export const checkAndDowngradeIfExpired = async (customer: Customer | null) => {
  const result = await evaluateSubscriptionLifecycle(customer);
  return {
    downgraded: result.stateChanged,
    updatedCustomer: result.updatedCustomer
  };
};

/**
 * Central Dynamic Permission Engine
 */
export const hasFeaturePermission = (
  customer: Customer | null,
  planObj: SystemPlan | null,
  featureId: string
): { allowed: boolean; reason?: string; isReadOnly?: boolean } => {
  if (!customer) return { allowed: false, reason: 'Authentication required.' };
  if (customer.subscription?.status === 'suspended') {
    return { allowed: false, reason: 'Subscription is suspended by system administrator.' };
  }

  const isGracePeriod = customer.subscription?.status === 'grace_period';
  const planFeatures = planObj?.features || [];
  const hasFeature = planFeatures.includes(featureId);

  if (!hasFeature) {
    return { allowed: false, reason: `Feature "${featureId}" is not included in active ${customer.plan} tier.` };
  }

  if (isGracePeriod) {
    return { allowed: true, isReadOnly: true, reason: 'Operating in Grace Period read-only mode.' };
  }

  return { allowed: true };
};

/**
 * Admin Subscription Override API Functions
 */
export const adminExtendSubscription = async (email: string, days: number = 30) => {
  const emailKey = email.replace(/\./g, ',');
  const snap = await get(ref(db, `customers/${emailKey}`));
  if (!snap.exists()) throw new Error("Customer not found.");

  const customer = decrypt(snap.val()) as Customer;
  const currentExpiry = customer.subscription?.expiresAt || Date.now();
  const newExpiry = currentExpiry + (days * 24 * 60 * 60 * 1000);

  const updatedCustomer: Customer = {
    ...customer,
    subscription: {
      ...(customer.subscription || {
        plan: customer.plan,
        billingCycle: 'monthly',
        purchasePrice: 0,
        activatedAt: Date.now(),
        autoDowngrade: true
      }),
      expiresAt: newExpiry,
      status: 'active'
    }
  };

  await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
  await logSubscriptionEvent(email, customer.secret, customer.plan, customer.plan, customer.subscription?.status || 'active', 'active', `Admin extended subscription by ${days} days`, 'admin');
  await sendInAppNotification(email, 'Subscription Extended', `An administrator extended your subscription by ${days} days.`, 'success');
};

export const adminSuspendSubscription = async (email: string) => {
  const emailKey = email.replace(/\./g, ',');
  const snap = await get(ref(db, `customers/${emailKey}`));
  if (!snap.exists()) throw new Error("Customer not found.");

  const customer = decrypt(snap.val()) as Customer;
  const updatedCustomer: Customer = {
    ...customer,
    subscription: {
      ...(customer.subscription || {
        plan: customer.plan,
        billingCycle: 'monthly',
        purchasePrice: 0,
        activatedAt: Date.now(),
        expiresAt: Date.now(),
        autoDowngrade: true
      }),
      status: 'suspended'
    }
  };

  await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
  await logSubscriptionEvent(email, customer.secret, customer.plan, customer.plan, customer.subscription?.status || 'active', 'suspended', 'Admin suspended subscription', 'admin');
  await sendInAppNotification(email, 'Subscription Suspended', 'Your subscription access has been suspended by an administrator.', 'error');
};

export const adminRestoreSubscription = async (email: string) => {
  const emailKey = email.replace(/\./g, ',');
  const snap = await get(ref(db, `customers/${emailKey}`));
  if (!snap.exists()) throw new Error("Customer not found.");

  const customer = decrypt(snap.val()) as Customer;
  const updatedCustomer: Customer = {
    ...customer,
    subscription: {
      ...(customer.subscription || {
        plan: customer.plan,
        billingCycle: 'monthly',
        purchasePrice: 0,
        activatedAt: Date.now(),
        expiresAt: Date.now() + SubscriptionConfig.MONTHLY_MS,
        autoDowngrade: true
      }),
      status: 'active'
    }
  };

  await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
  await logSubscriptionEvent(email, customer.secret, customer.plan, customer.plan, 'suspended', 'active', 'Admin restored subscription', 'admin');
  await sendInAppNotification(email, 'Subscription Restored', 'Your subscription has been restored to active status.', 'success');
};
