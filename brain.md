# DeepXAuth (DXA) Project Intelligence & Knowledge File (`brain.md`)

> **Notice to AI Assistants & Developers**: This document acts as the single source of truth and complete memory for the **DeepXAuth** codebase. It contains exhaustive technical, architectural, functional, and security details. Reading this document gives full understanding of the entire project without needing to re-scan repository files.

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Architecture](#4-architecture)
5. [Authentication Flow](#5-authentication-flow)
6. [Customer Flow](#6-customer-flow)
7. [Admin Flow](#7-admin-flow)
8. [Database Structure](#8-database-structure)
9. [Firebase Structure & Security Rules](#9-firebase-structure--security-rules)
10. [API Reference](#10-api-reference)
11. [Cloudflare Workers](#11-cloudflare-workers)
12. [Services](#12-services)
13. [Components](#13-components)
14. [Routes](#14-routes)
15. [Hooks](#15-hooks)
16. [Utilities](#16-utilities)
17. [SDK System & Live API Sandbox](#17-sdk-system--live-api-sandbox)
18. [User Activity Timeline & Audit Logging System](#18-user-activity-timeline--audit-logging-system)
19. [Subscription Engine](#19-subscription-engine)
20. [Credit System](#20-credit-system)
21. [Infrastructure Plans](#21-infrastructure-plans)
22. [Security](#22-security)
23. [Encryption](#23-encryption)
24. [Important Constants](#24-important-constants)
25. [Environment Variables](#25-environment-variables)
26. [External Integrations](#26-external-integrations)
27. [Build Process](#27-build-process)
28. [Deployment](#28-deployment)
29. [Coding Patterns](#29-coding-patterns)
30. [Reusable Components](#30-reusable-components)
31. [Common Workflows](#31-common-workflows)
32. [Project Conventions](#32-project-conventions)
33. [Current Known Issues](#33-current-known-issues)
34. [TODOs & Completed Progress](#34-todos--completed-progress)
35. [Future Improvements](#35-future-improvements)
36. [Glossary](#36-glossary)

---

## 1. Project Overview

### Purpose & Objective
**DeepXAuth (DXA)** (package name: `dxa-security`, worker: `deepxauth-cfire`) is a high-performance, edge-optimized, commercial-grade authentication, licensing, remote configuration, audit logging, and anti-tamper security SaaS platform. It enables software developers, game creators, and enterprise publishers to effortlessly protect desktop, web, and mobile applications against piracy, unauthorized usage, and account sharing.

### Key Value Propositions
- **Multi-Tenant SaaS Licensing**: Software developers create accounts, define applications, issue software licenses, and manage end-user credentials.
- **Hardware ID (HWID) Binding**: Binds user credentials to specific client computer hardware (UUID/BIOS/MAC/Motherboard CPU ID) to eliminate account sharing.
- **User Activity Timeline & Central Audit Logging**: Real-time immutable audit stream tracking all authentication, app, license, subscription, reseller, and security events with side-drawer telemetry inspection and CSV/JSON/PDF exports.
- **Interactive Live SDK Sandbox**: Built-in developer sandbox for testing live Worker API endpoints (`/login`, `/register`, `/versioncheck`, `/getvariable`, `/getvariables`) with metric latency analytics and RSA signature verification.
- **Anti-Bot & Anti-Replay Protection**: Integrated Cloudflare Turnstile CAPTCHA and RSA-256 digital response signing with timestamp/nonce replay attack prevention.
- **Reseller Ecosystem**: Dedicated portal enabling third-party resellers to issue licenses and create accounts under defined application quotas.
- **Credit & Tiered Infrastructure Billing**: Features subscription plans (Free, Developer, Pro, Enterprise) and credit top-up packages (with UPI/QR code screenshot proof submission and admin fulfillment).

---

## 2. Tech Stack

### Core Web Framework & Frontend
- **Framework**: React 19 (`react` v19.2.3, `react-dom` v19.2.3)
- **Language**: TypeScript 5.8 (`typescript` ~5.8.2)
- **Bundler & Dev Server**: Vite 6 (`vite` ^6.4.3, `@vitejs/plugin-react` ^5.0.0)
- **Routing**: React Router DOM 7 (`react-router-dom` ^7.11.0) using `HashRouter`
- **Code Editor**: Monaco Editor (`@monaco-editor/react` ^4.7.0) for live SDK and code viewing
- **Icons**: Lucide React (`lucide-react` ^0.562.0)

### Backend & Edge API
- **Edge Framework**: Hono 4 (`hono` ^4.0.0, `hono/cloudflare-pages`)
- **Serverless Platform**: Cloudflare Workers / Cloudflare Pages Functions (`wrangler` ^4.80.0)
- **Encryption Library**: CryptoJS (`crypto-js` ^4.2.0) for client-side and worker-side AES encryption

### Database & Authentication
- **Database**: Firebase Realtime Database (v12.7.0 client SDK + REST API calls from Worker)
- **Authentication**: Firebase Authentication (Email/Password)
- **Bot Protection**: Cloudflare Turnstile CAPTCHA (`@marsidev/react-turnstile` style script integration)

---

## 3. Folder Structure

Below is the complete tree listing of all files and folders in the repository:

```
Deeps-X-Auth/
├── .dev.vars                          # Local environment secrets for Cloudflare Worker execution
├── .env                               # Local environment variables for Vite frontend
├── .gitignore                         # Git ignore patterns
├── App.tsx                            # Root React App component with router, layout, and global guards
├── Docs.tsx                           # Standalone documentation component & SDK Sandbox shortcuts
├── README.md                          # Repository overview and setup documentation
├── brain.md                           # Single source of truth project memory file
├── constants.ts                       # System constants, fallback config, default credit packages
├── deployment-checklist.md            # Production deployment checklist
├── env.d.ts                           # Vite environment variable TypeScript definitions
├── firebase-rules.json                # Strict Firebase Realtime Database access control rules
├── firebase.ts                        # Root Firebase initialization script (re-exported via services)
├── index.css                          # Core design system: Vanilla CSS, Glassmorphic tokens, animations
├── index.html                         # Application entry HTML with Google Fonts & Turnstile scripts
├── index.tsx                          # React DOM root render file
├── metadata.json                      # Application metadata
├── package-lock.json                  # NPM lockfile
├── package.json                       # Dependencies, scripts, and build configuration
├── release-report.md                  # Release summary documentation
├── security-report.md                 # Security architecture documentation
├── tsconfig.json                      # TypeScript configuration
├── types.ts                           # Platform core data interfaces and types
├── wrangler.toml                      # Cloudflare Worker configuration
├── components/                        # UI Component Library
│   ├── BrandMark.tsx                  # Animated DXA logo mark
│   ├── CommandItem.tsx                # Command Palette item renderer with icon map
│   ├── CommandPalette.tsx             # Universal Command Palette modal (Ctrl+K)
│   ├── CursorGlow.tsx                 # Ambient background cursor glow
│   ├── LoadingScreen.tsx              # Cyberpunk preloader animation
│   ├── docs/                          # Documentation sub-components
│   │   ├── QuickStart.tsx             # Interactive QuickStart banner
│   │   └── SDKSandbox.tsx             # Live API Sandbox testing component
│   └── timeline/                      # Activity Timeline & Audit UI Library
│       ├── TimelineCard.tsx           # Glassmorphic audit event card component
│       ├── TimelineDrawer.tsx         # Slide-over side inspection drawer component
│       ├── TimelineFilters.tsx        # Date range, category, severity & app filter bar
│       ├── TimelineHeader.tsx         # Audit summary header & CSV/JSON/PDF export triggers
│       ├── TimelineSearch.tsx         # Real-time search query input component
│       └── TimelineSeverityBadge.tsx  # Color-coded severity badge component
├── functions/                         # Cloudflare Pages Functions
│   └── [[route]].js                   # Edge API Router, Hono worker, dispatchEdgeAuditLog, webhooks
├── hooks/                             # Custom React Hooks
│   ├── useCommandPalette.ts           # Keyboard shortcuts (Ctrl+K) hook
│   └── useTimeline.ts                 # Real-time audit stream subscription & filter engine hook
├── pages/                             # Page Route Components
│   ├── Admin.tsx                      # Super-Admin console (plans, SDKs, users, credit approvals)
│   ├── Dashboard.tsx                  # Developer dashboard (apps, users, licenses, vars, sandbox, timeline)
│   ├── Docs.tsx                       # Complete developer documentation & SDK generator
│   ├── ForgotPassword.tsx             # Password recovery page
│   ├── Landing.tsx                    # Commercial marketing landing page
│   ├── Login.tsx                      # Customer & Admin login page
│   ├── NotFound.tsx                   # 404 Error page
│   ├── ResellerPortal.tsx             # Multi-tenant reseller portal
│   ├── Shop.tsx                       # Credit top-up store & subscription plan manager
│   ├── Signup.tsx                     # Developer registration page
│   ├── TOS.tsx                        # Terms of Service & Privacy Policy page
│   └── Timeline.tsx                   # Enterprise Audit Activity Timeline page
├── security/                          # Security utilities & schemas
├── services/                          # Application Business Logic & Services
│   ├── auditService.ts                # Central audit logger, sanitizeObject, local backup, export engines
│   ├── commandPaletteService.ts       # Command registry for global palette search & navigation
│   ├── encryption.ts                  # AES-256 CryptoJS encryption & decryption helpers
│   ├── firebase.ts                    # Re-export of root Firebase Auth & Database instances
│   ├── sandboxService.ts              # Live API Sandbox execution & RSA signature verification
│   ├── sdkService.ts                  # SDK repository management & Firebase sync
│   ├── subscriptionService.ts         # Subscription status calculator & grace period manager
│   └── toastService.ts                # Toast notification system
├── types/                             # Domain Type Declarations
│   ├── audit.ts                       # Audit Log data models, categories, severities, actor types
│   ├── commandPalette.ts              # Command Palette type definitions
│   └── sandbox.ts                     # Live API Sandbox request/response metrics interfaces
└── utils/                             # Shared Helper Utilities
    └── rsaVerifier.ts                 # Client-side RSA-SHA256 response signature verifier
```

---

## 4. Architecture

DeepXAuth follows a decoupled, edge-first serverless architecture:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Client Web Browser                            │
│  (React 19, TypeScript, HashRouter, Tailwind/Vanilla Glassmorphic CSS)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌───────────────────┐     ┌────────────────────┐     ┌───────────────────┐
│ Firebase Auth &   │     │ Cloudflare Worker  │     │ Realtime DB       │
│ User Database     │     │ Edge API Engine    │     │ system/auditLogs  │
└───────────────────┘     └──────────┬─────────┘     └───────────────────┘
                                     │
                                     ▼
                          ┌────────────────────┐
                          │ External Discord   │
                          │ Webhook Dispatch   │
                          └────────────────────┘
```

---

## 5. Authentication Flow

### 1. Developer Authentication
- Developers log in using Firebase Auth (`signInWithEmailAndPassword`) on `/login`.
- Upon login, `App.tsx` reads user record from `customers/${emailKey}`.
- If email matches `ADMIN_EMAIL` (`deepsrajput1101@gmail.com`), the user receives Super Admin rights.

### 2. Client Application Authentication (`functions/[[route]].js`)
- Client applications (C#, C++, Python, Rust, etc.) send a `POST` request to `/login` on `https://deepxauth-api.pages.dev/login`.
- The Edge Worker verifies:
  1. IP Rate Limiting (max 10 requests per minute).
  2. Application metadata (`applicationPaused`).
  3. App Version match (`VERSION_MISMATCH` check).
  4. User credentials & ban status (`isBanned`).
  5. HWID binding match (`HWID_MISMATCH` check).
  6. License expiry date.
- Worker logs audit event via `dispatchEdgeAuditLog(c, ...)` to `system/auditLogs/${eventId}` asynchronously via `waitUntil`.
- Worker returns an RSA-256 digitally signed JSON payload containing `LOGIN_SUCCESS`.

---

## 6. Customer Flow

### Dashboard Tabs (`Dashboard.tsx`)
- **Overview**: Active plan indicator, resource usage counters (Apps, Users, Licenses, Variables), quick copy secret key.
- **Applications**: Create new app, set version, toggle pause state, view app-specific metadata, delete application.
- **Users**: List all registered end-users, create direct users, reset HWID, toggle ban status, set expiration dates, support `oneTime` temporary access keys.
- **Licenses**: Generate batch license keys with customizable expiry, ranks, and notes. View unused vs used keys.
- **Variables**: Store encrypted remote variables accessible by clients via `/getvariable` or `/getvariables`.
- **Webhooks**: Configure Discord webhook notifications (`url`, `notifyLogin`, `notifyAddUser`, `notifyDeleteUser`, `notifyAddLicense`, `notifyExpireLicense`, `notifyPauseApp`).
- **Resellers**: Issue reseller credentials, set user/license limits, assign allowed applications.
- **Earn / Rewards**: Daily check-in rewards, weekly bonuses, Discord boost claim integration.
- **SDK Sandbox**: Live API endpoint tester with RSA signature verification, metric analytics, and multi-language code snippets.
- **Activity Timeline**: Live security event stream, multi-field search, filtering, side drawer telemetry inspection, and CSV/JSON/PDF exports.

---

## 7. Admin Flow

Super Admin access (`/admin`) is locked to `deepsrajput1101@gmail.com` (`ADMIN_EMAIL`).

### Super-Admin Capabilities (`Admin.tsx`)
1. **Super Admin Bypass**: Admin email bypasses feature locks (`isFeatureLocked`) and app limits across all plan tiers (including Free Plan).
2. **Customer Management**: View all platform customers, edit plan levels, manually alter credit balances, adjust subscription statuses, or delete customer accounts.
3. **Infrastructure Plan Management**: Create, edit, clone, or delete platform plans (`Free Plan`, `Starter`, `Pro`, `Enterprise`). Toggles available features including `Live API Testing (SDK Sandbox)` (`sandbox`) and `Activity Timeline (Audit Logs)` (`timeline`).
4. **Credit Requests & Payment Fulfillment**: Review pending user top-up requests (`system/creditRequests`), inspect transaction notes and uploaded payment screenshots, approve or reject.
5. **Payment Configuration**: Edit global payment instructions, update UPI ID, upload QR Code image URL, configure credit packages.
6. **SDK Repository**: Add, edit, toggle visibility, and update SDK code templates.
7. **System Control**: Toggle Maintenance Mode globally (`system/config/maintenanceMode`).

---

## 8. Database Structure

Firebase Realtime Database nodes store data in JSON format. All email addresses used as keys replace `.` with `,` (e.g., `user@domain.com` -> `user@domain,com`).

### Primary Node Breakdown

```
root/
├── customers/
│   └── ${emailKey}/                     # e.g., "deepsrajput1101@gmail,com"
│       ├── email: string
│       ├── secret: string              # e.g., "DXA-7F8A..."
│       ├── plan: string                # e.g., "Developer Plan"
│       ├── credits: number             # e.g., 1500
│       ├── createdAt: ISO string
│       ├── subscription: SubscriptionRecord object
│       └── subscriptionHistory: Array of SubscriptionHistoryItem
│
├── customerNotifications/
│   └── ${emailKey}/
│       └── ${notificationId}/          # InAppNotification object
│
├── applications/
│   └── ${userSecret}/                  # Customer's DXA Secret
│       └── ${appName}/                 # Application name (e.g., "MyGame")
│           ├── metadata/               # Encrypted metadata object
│           ├── users/                  # Encrypted user objects
│           ├── licenses/               # Encrypted license objects
│           └── variables/              # Encrypted string variable values
│
├── webhookSettings/
│   └── ${userSecret}/                  # WebhookSettings object
│
├── resellers/
│   └── ${hash}/                        # Secure reseller URL hash
│
└── system/
    ├── auditLogs/                      # AuditLogItem objects
    │   └── ${eventId}/                 # eventId, timestamp, type, category, severity, actorType, actorEmail, actorSecret, application, username, licenseKey, ip, country, device, os, hwid, description, metadata, status
    ├── config/                         # SystemConfig object
    ├── plans/                          # SystemPlan objects (Free, Starter, Pro, Enterprise)
    ├── planAuditLogs/                  # Encrypted PlanAuditLog objects
    ├── creditPackages/                 # CreditPackage objects
    ├── paymentConfig/                  # PaymentConfig object (UPI ID, QR URL)
    ├── creditRequests/                 # CreditTopUpRequest objects
    ├── sdks/                           # SDK objects
    └── subscriptionEvents/             # SubscriptionLifecycleEvent objects
```

---

## 9. Firebase Structure & Security Rules

The `firebase-rules.json` enforces exact node access rules:

```json
{
  "rules": {
    "system": {
      "auditLogs": {
        ".read": "auth != null",
        ".write": true,
        ".indexOn": ["timestamp", "category", "severity", "actorType", "status"]
      },
      "config": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "plans": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "stats": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || auth.token.role === 'worker' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "sdks": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "creditPackages": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "paymentConfig": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "creditRequests": {
        ".read": "auth != null",
        ".write": "auth != null"
      },
      "planAuditLogs": {
        ".read": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))",
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))"
      },
      "subscriptionEvents": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "customerNotifications": {
      "$emailKey": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "customers": {
      ".read": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))",
      "$emailKey": {
        ".read": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com') || (auth.token.email != null && auth.token.email.replace('.', ',') === $emailKey))",
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com') || (auth.token.email != null && auth.token.email.replace('.', ',') === $emailKey))"
      }
    },
    "applications": {
      ".read": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || (auth.token.email != null && auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com'))",
      "$userSecret": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "webhookSettings": {
      "$userSecret": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "resellers": {
      ".read": "auth != null",
      ".indexOn": ["createdBy"],
      "$hash": {
        ".read": true,
        ".write": "auth != null"
      }
    },
    "resellerWebhooks": {
      "$hash": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 10. API Reference

All API requests route through the Cloudflare Worker (`functions/[[route]].js`).

### Base URL
- Production Edge API: `https://deepxauth-api.pages.dev` or `/api` via Cloudflare Pages Functions.

### Endpoints
- `POST /login`: Authenticates user credentials, checks HWID lock, verifies subscription status, logs `USER_LOGIN` / `FAILED_LOGIN` / `VERSION_MISMATCH` / `HWID_MISMATCH` events.
- `POST /register`: Registers new end-user account or redeems license key.
- `POST /versioncheck`: Checks client application release version against deployed metadata.
- `POST /getvariable`: Returns encrypted remote cloud variable.
- `POST /getvariables`: Returns all encrypted remote cloud variables for the application.

---

## 11. Cloudflare Workers

Implemented in `functions/[[route]].js`:
- Uses Hono web framework.
- Helper `dispatchEdgeAuditLog(c, auditData)` records worker events asynchronously to `system/auditLogs/${eventId}` via `c.executionCtx.waitUntil`.
- Helper `dispatchEdgeWebhook(c, secret, eventType, eventData)` dispatches Discord embeds for security events.
- Edge IP Rate Limiting (`isRateLimited` function) caps requests at 10 requests per minute per IP.

---

## 12. Services

- `auditService.ts`: Central audit logger, payload sanitizer (`sanitizeObject`), local storage backup buffer (`dxa_audit_logs_local`), CSV/JSON/PDF exporters.
- `sandboxService.ts`: Executes live worker API requests, calculates metrics (latency, payload size, HTTP status), and invokes client-side RSA signature verifications.
- `subscriptionService.ts`: Evaluates subscription state, manages 7-day grace period, executes plan downgrades.
- `sdkService.ts`: Manages SDK repository templates in Firebase database node `system/sdks`.
- `commandPaletteService.ts`: Central registry for universal keyboard search commands (`Ctrl+K`).

---

## 13. Components

- `components/timeline/TimelineHeader.tsx`: Renders real-time stream status, summary stats, and CSV/JSON/PDF export actions.
- `components/timeline/TimelineSearch.tsx`: Real-time query search bar.
- `components/timeline/TimelineFilters.tsx`: Dropdown controls for date range, category, severity, actor type, and application filtering.
- `components/timeline/TimelineCard.tsx`: Glassmorphic event card with category icons, actor badges, timestamp, and severity indicator.
- `components/timeline/TimelineDrawer.tsx`: Slide-over side drawer for inspecting raw JSON, device/network telemetry (IP, Country, User Agent, HWID), and state diffs.
- `components/timeline/TimelineSeverityBadge.tsx`: Color-coded severity badge component.
- `components/docs/SDKSandbox.tsx`: Live API Endpoint testing environment.
- `components/CommandPalette.tsx`: Global search modal (`Ctrl+K`).

---

## 14. Routes

Defined in `App.tsx` using `react-router-dom`:

| Path | Component | Description | Access |
|---|---|---|---|
| `/` | `Landing` | Homepage, features, pricing preview | Public |
| `/login` | `Login` | Customer & Admin login screen | Public |
| `/signup` | `Signup` | Developer registration screen | Public |
| `/forgot-password` | `ForgotPassword` | Password recovery page | Public |
| `/dashboard` | `Dashboard` | App management, users, licenses, vars, sandbox, timeline | Customer |
| `/admin` | `Admin` | Platform management control panel | Admin Only |
| `/shop` | `Shop` | Plan subscriptions & credit top-up store | Customer |
| `/timeline` | `Timeline` | Enterprise Audit Activity Timeline page | Customer |
| `/reseller/:hash` | `ResellerPortal` | Reseller user & key management portal | Reseller Hash |
| `/docs` | `Docs` | Complete documentation & interactive API cards | Public |
| `/tos` | `TOS` | Terms of Service & Privacy Policy | Public |
| `*` | `NotFound` | 404 Fallback view | Public |

---

## 15. Hooks

- `useTimeline.ts`: Custom hook managing live real-time subscription to `system/auditLogs`, date range filtering, multi-field search, pagination, and summary metric calculations.
- `useCommandPalette.ts`: Keyboard shortcut hook binding `Ctrl+K` and `Cmd+K`.

---

## 16. Utilities

- `utils/rsaVerifier.ts`: Client-side RSA-SHA256 response signature verifier using Web Crypto API (`crypto.subtle`) and PEM public key (`DXA_PUBLIC_KEY_PEM`).
- `services/encryption.ts`: AES-256 encryption & decryption using CryptoJS.

---

## 17. SDK System & Live API Sandbox

- Native SDK code templates supported for 7 programming languages (Python, C#, C++, Java, Rust, Go, TypeScript).
- Interactive Live SDK Sandbox integrated into `Dashboard.tsx` and `Docs.tsx` (`#sandbox`).
- Code snippet generator generates equivalent ready-to-run snippets in Python, C#, C++, Java, Rust, Go, and TypeScript.

---

## 18. User Activity Timeline & Audit Logging System

- **Database Path**: `system/auditLogs/${eventId}`
- **Severities**: `Info` (Blue), `Success` (Green), `Warning` (Yellow), `Critical` (Red).
- **Categories**: `Authentication`, `Application`, `User`, `License`, `Subscription`, `Credit`, `Variable`, `Webhook`, `Reseller`, `Admin`, `Security`.
- **Hybrid Storage**: Local Storage backup buffer (`dxa_audit_logs_local`) combined with real-time Firebase DB sync to ensure 100% immediate rendering.
- **Redaction**: Automatic sanitization redacts `password`, `secret`, `token`, `key`, `privatekey`, `auth`, `hash`.
- **Exporters**: One-click exports to CSV, JSON, and printable PDF reports.

---

## 19. Subscription Engine

Managed by `services/subscriptionService.ts`.

### Lifecycle Flow
```
[ Active ] ──(Expires)──> [ Grace Period (7 Days) ] ──(Unpaid)──> [ Auto-Downgraded to Free ]
    │                             │
    └───────(Renews Payment)──────┴────────> [ Active ]
```

---

## 20. Credit System

- Internal platform currency for plan purchases and feature usage.
- Top-up requests submitted via `/shop` with UPI payment proof screenshots (`CreditTopUpRequest`) and approved in `/admin`.

---

## 21. Infrastructure Plans

Defined in `types.ts` (`SystemPlan`):
- Features include: `sandbox` (Live API Sandbox), `timeline` (Activity Timeline), `cloud_vars`, `multi_app`, `webhooks`, `reseller`, `user_data`.
- Admin configures feature toggles per plan tier in `Admin.tsx` (`InfrastructurePlanEditorModal`).
- Super Admin (`deepsrajput1101@gmail.com`) bypasses feature locks and app limits across all plan tiers.

---

## 22. Security

- RSA-SHA256 digital response signing.
- Rate limiting at edge (10 requests/minute/IP).
- HWID machine binding.
- Replay attack prevention via timestamp and nonce validation.
- CAPTCHA protection via Cloudflare Turnstile.

---

## 23. Encryption

- AES-256 encryption via CryptoJS for application metadata, users, licenses, and remote variables.

---

## 24. Important Constants

Defined in `constants.ts`:
- `ADMIN_EMAIL`: `deepsrajput1101@gmail.com`
- `FIREBASE_CONFIG`: Config object loaded via `import.meta.env.VITE_FIREBASE_*`.

---

## 25. Environment Variables

Loaded via Vite (`import.meta.env`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_ADMIN_EMAIL`
- `VITE_TURNSTILE_SITE_KEY`
- `VITE_DB_SECRET`

---

## 26. Build Process

- Command: `npx vite build`
- Output: Single-page application bundle written to `dist/` (HTML, CSS, JS chunks).
- Compilation Status: **1785 modules transformed with 0 errors (`exit code 0`)**.

---

## 27. Deployment

- Frontend: Cloudflare Pages / Vercel / Netlify (`dist` directory).
- Edge API: Cloudflare Pages Functions (`functions/[[route]].js`).
- Database: Firebase Realtime Database with `firebase-rules.json`.

---

## 28. Coding Patterns

- Pure Vanilla CSS design system with CSS variable tokens in `index.css`.
- React 19 functional components with TypeScript interfaces.
- Memoized components (`React.memo`, `useMemo`, `useCallback`) for high performance.

---

## 29. Reusable Components

- `<TimelineHeader />`, `<TimelineSearch />`, `<TimelineFilters />`, `<TimelineCard />`, `<TimelineDrawer />`, `<TimelineSeverityBadge />`.
- `<SDKSandbox />`, `<QuickStart />`.
- `<CommandPalette />`, `<CommandItem />`.
- `<BrandMark />`, `<LoadingScreen />`, `<CursorGlow />`.

---

## 30. Common Workflows

### Workflow A: Live API Sandbox & Audit Timeline Verification
1. Developer opens `/dashboard` → clicks **SDK Sandbox**.
2. Developer executes `/login` request.
3. Worker Edge API processes request, verifies HWID & version, signs response with RSA private key, logs event via `dispatchEdgeAuditLog`.
4. Developer switches to **Activity Timeline** tab → event appears instantly at the top of the stream.
5. Developer clicks event card to inspect network telemetry, IP, HWID, and raw JSON in side drawer.

---

## 31. Project Conventions

- PascalCase for React components (`TimelineCard.tsx`, `SDKSandbox.tsx`).
- camelCase for services and hooks (`auditService.ts`, `useTimeline.ts`).
- Email keys in Firebase replace `.` with `,`.

---

## 32. Current Known Issues

None. All compilation checks, route handlers, and UI components are operating cleanly.

---

## 33. TODOs & Completed Progress

- [x] Implement User Activity Timeline & Central Audit Logging System (`types/audit.ts`, `services/auditService.ts`, `hooks/useTimeline.ts`, `pages/Timeline.tsx`, `components/timeline/*`).
- [x] Integrate Edge Worker Audit Logging (`dispatchEdgeAuditLog`) into `functions/[[route]].js`.
- [x] Build Live API Testing SDK Sandbox (`components/docs/SDKSandbox.tsx`, `services/sandboxService.ts`, `utils/rsaVerifier.ts`).
- [x] Add Admin per-plan feature toggles (`sandbox` & `timeline`) in `Admin.tsx` (`InfrastructurePlanEditorModal`).
- [x] Add Super Admin Email Bypass (`ADMIN_EMAIL`) overriding plan feature gates and app creation limits across all plan tiers.
- [x] Provide exact Firebase Realtime Database Security Rules for `system/auditLogs`.

---

## 34. Future Improvements

- **Automated Payment Gateway**: Integrate Stripe / Razorpay Webhooks for instant credit top-up and subscription activation.
- **WebSocket / Server-Sent Events (SSE)**: Implement live streaming audit notifications in the Admin panel.
- **Package Manager SDKs**: Publish official SDK packages to NuGet (`DeepXAuth.NET`), PyPI (`deepxauth`), and Crates.io (`deepxauth-rs`).

---

## 35. Glossary

- **DXA**: DeepXAuth platform acronym.
- **Customer Secret**: A unique developer API identifier formatted as `DXA-XXXXXX`.
- **HWID**: Hardware Identification string uniquely identifying a client device.
- **Audit Event**: Structured security or operational log record stored in `system/auditLogs`.
- **SDK Sandbox**: Live API endpoint testing environment.
- **Turnstile**: Cloudflare's privacy-focused anti-bot CAPTCHA alternative.
- **Hono**: Ultrafast web framework for Cloudflare Workers.
