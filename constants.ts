export const BRAND_NAME = "Not Exe";
export const BRAND_SHORT = "NOT EXE";
export const BRAND_TAGLINE = "Next-Gen Authentication & Anti-Crack Protection";
export const BRAND_PREFIX = "NXE";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "";
export const DB_SECRET = import.meta.env.VITE_DB_SECRET || "";

export const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";
export const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "";

export const DEFAULT_CREDIT_PACKAGES = [
  {
    id: 'starter_pack',
    name: 'Starter Pack',
    credits: 50,
    priceINR: 499,
    popular: false,
    recommendedFor: 'Starter Plan (Monthly)',
    badge: 'Standard',
    order: 1
  },
  {
    id: 'pro_pack',
    name: 'Pro Infrastructure Pack',
    credits: 150,
    priceINR: 1299,
    popular: true,
    recommendedFor: 'Pro Plan (Monthly)',
    badge: 'Popular • Save 13%',
    order: 2
  },
  {
    id: 'enterprise_pack',
    name: 'Enterprise Pack',
    credits: 300,
    priceINR: 2499,
    popular: false,
    recommendedFor: 'Enterprise Plan (Monthly)',
    badge: 'Best Scale',
    order: 3
  },
  {
    id: 'scale_pack',
    name: 'Developer Scale Pack',
    credits: 500,
    priceINR: 3999,
    popular: false,
    recommendedFor: 'Multi-App Scale',
    badge: 'Save 20%',
    order: 4
  },
  {
    id: 'yearly_pack',
    name: 'Annual Infrastructure Pack',
    credits: 1500,
    priceINR: 9999,
    popular: false,
    recommendedFor: 'Yearly Subscriptions',
    badge: 'Ultimate Value',
    order: 5
  }
];
