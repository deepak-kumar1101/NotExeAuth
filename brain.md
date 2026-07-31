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
17. [SDK System](#17-sdk-system)
18. [Subscription Engine](#18-subscription-engine)
19. [Credit System](#19-credit-system)
20. [Infrastructure Plans](#20-infrastructure-plans)
21. [Security](#21-security)
22. [Encryption](#22-encryption)
23. [Important Constants](#23-important-constants)
24. [Environment Variables](#24-environment-variables)
25. [External Integrations](#25-external-integrations)
26. [Build Process](#26-build-process)
27. [Deployment](#27-deployment)
28. [Coding Patterns](#28-coding-patterns)
29. [Reusable Components](#29-reusable-components)
30. [Common Workflows](#30-common-workflows)
31. [Project Conventions](#31-project-conventions)
32. [Current Known Issues](#32-current-known-issues)
33. [TODOs](#33-todos)
34. [Future Improvements](#34-future-improvements)
35. [Glossary](#35-glossary)

---

## 1. Project Overview

### Purpose & Objective
**DeepXAuth (DXA)** (package name: `dxa-security`, worker: `deepxauth-cfire`) is a high-performance, edge-optimized, commercial-grade authentication, licensing, remote configuration, and anti-tamper security SaaS platform. It enables software developers, game creators, and enterprise publishers to effortlessly protect desktop, web, and mobile applications against piracy, unauthorized usage, and account sharing.

### Key Value Propositions
- **Multi-Tenant SaaS Licensing**: Software developers create accounts, define applications, issue software licenses, and manage end-user credentials.
- **Hardware ID (HWID) Binding**: Binds user credentials to specific client computer hardware (UUID/BIOS/MAC/Motherboard CPU ID) to eliminate account sharing.
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
├── Docs.tsx                           # Standalone documentation component (root reference copy)
├── README.md                          # Repository overview and setup documentation
├── constants.ts                       # System constants, fallback config, default credit packages
├── env.d.ts                           # Vite environment variable TypeScript definitions
├── firebase-rules.json                # Strict Firebase Realtime Database access control rules
├── firebase.ts                        # Root Firebase initialization script (re-exported via services)
├── index.css                          # Core design system: Vanilla CSS, Glassmorphism, animations
├── index.html                         # Application entry HTML with Google Fonts & Turnstile scripts
├── index.tsx                          # React DOM root render file
├── metadata.json                      # Project metadata configuration
├── package.json                       # npm package dependencies and build/deploy scripts
├── package-lock.json                  # Dependency lockfile
├── tsconfig.json                      # TypeScript compiler options
├── types.ts                           # Comprehensive TypeScript data models & schema definitions
├── vite.config.ts                     # Vite build & plugin configuration
├── wrangler.toml                      # Cloudflare Worker deployment manifest
├── components/                        # Reusable UI component library
│   ├── BrandMark.tsx                  # Premium animated logo mark component
│   ├── CreditPricingPanel.tsx         # Admin credit package manager grid
│   ├── CursorGlow.tsx                 # Interactive mouse radial gradient follower
│   ├── LoadingScreen.tsx              # Application initialization loading screen
│   ├── SkeletonLoader.tsx             # Shimmering loading placeholders
│   ├── Toast.tsx                      # Floating notification overlay UI
│   └── Turnstile.tsx                  # Cloudflare Turnstile anti-bot component wrapper
├── functions/                         # Cloudflare Pages Functions (Edge API)
│   └── [[route]].js                   # Hono-based edge router implementing all API endpoints
├── pages/                             # Core page views & route handlers
│   ├── Admin.tsx                      # Super-Admin control panel (123KB)
│   ├── Dashboard.tsx                  # Customer developer portal (120KB)
│   ├── Docs.tsx                       # Full documentation page with interactive API cards (42KB)
│   ├── ForgotPassword.tsx             # Password recovery request page
│   ├── Landing.tsx                    # Public marketing homepage & features showcase (39KB)
│   ├── Login.tsx                      # Customer & Admin login page
│   ├── NotFound.tsx                   # 404 Error fallback page
│   ├── ResellerPortal.tsx             # Hash-authenticated reseller management portal (70KB)
│   ├── Shop.tsx                       # Subscriptions & Credit top-up store page (87KB)
│   ├── Signup.tsx                     # Developer account registration page
│   └── TOS.tsx                        # Terms of Service & Privacy Policy page
├── public/                            # Static assets directory
│   ├── dashboard.png                  # Product preview screenshot
│   ├── favicon.ico                    # App favicon
│   └── txa-response-signing-public.pem# RSA Public Key for verifying API signatures
├── security/                          # Cryptographic key files
│   ├── txa-response-signing-private.pem# RSA 2048-bit Private Key for signing worker responses
│   └── txa-response-signing-public.pem # RSA Public Key reference copy
├── services/                          # Business logic, state, and API service layer
│   ├── encryption.ts                  # AES encryption/decryption utilities
│   ├── firebase.ts                    # Firebase Auth & Realtime DB instances export
│   ├── sdkService.ts                  # SDK repository listener & code generator service
│   ├── subscriptionService.ts         # Subscription lifecycle evaluator & quota guards
│   └── toastService.ts                # Toast event bus for trigger notifications
└── src/                               # Standalone Worker entry directory
    └── index.js                       # Alternative/standalone Cloudflare Worker script
```

---

## 4. Architecture

### System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 CLIENT LAYER                                      |
|                                                                                   |
|  +---------------------------+                +--------------------------------+  |
|  | Native Client / App SDK   |                | Web Browser (React 19 Frontend)|  |
|  | (Python, C#, C++, Java,   |                | - Customer Dashboard           |  |
|  |  Rust, Go, TypeScript)    |                | - Super-Admin Panel            |  |
|  +-------------+-------------+                | - Reseller Portal              |  |
|                |                              +---------------+----------------+  |
+----------------|----------------------------------------------|-------------------+
                 | HTTPS API Requests                           | Firebase Web SDK
                 v (Signed & Encrypted)                         v & Auth
+----------------------------------------+      +-----------------------------------+
|            EDGE API LAYER              |      |         FIREBASE SERVICE          |
|  Cloudflare Worker / Pages Functions   |      |                                   |
|  (`functions/[[route]].js` / Hono)     |      |  - Firebase Authentication        |
|  - Rate Limiting (10 req/min/IP)       |      |    (User session tokens)          |
|  - RSA-256 Response Digital Signing    |      |  - Firebase Realtime Database     |
|  - Anti-Replay Nonce Cache             |      |    (Encrypted JSON nodes)         |
|  - AES Decryption / Validation         |      |                                   |
+----------------+-----------------------+      +-----------------+-----------------+
                 | REST API (Auth Token)                          ^
                 +------------------------------------------------+
```

### Multitenancy Model
1. **Customer Tier**: A developer signs up and receives a unique `secret` key (e.g., `DXA-A1B2C3D4...`).
2. **Application Tier**: Under their `secret`, a Customer can create multiple `applications` (e.g. `MyGame`, `ProTool`).
3. **Resource Tier**: Each Application contains its isolated collection of:
   - `users`: End-user accounts created for that specific software.
   - `licenses`: Generated license keys ready for user activation.
   - `variables`: Remote key-value configurations pushed to clients.
   - `metadata`: App version number, maintenance/pause state, creation date.
4. **Reseller Tier**: Resellers are assigned to specific applications under a customer account with custom limits.

---

## 5. Authentication Flow

### 1. Web UI Developer Auth (Customer / Admin)
- Developers log in using Email & Password via Firebase Auth (`signInWithEmailAndPassword`).
- Upon registration (`Signup.tsx`), a unique `secret` is generated and saved to `customers/${emailKey}.secret`.
- If the authenticated email matches `deepsrajput1101@gmail.com` (`ADMIN_EMAIL`), the system grants Super-Admin privileges.

### 2. Client Application SDK Authentication (`/login`)
1. Client software sends `POST /login` to the Edge API with:
   - `username`, `password`, `secret`, `appName`, `appVersion`, `hwid`, `clientNonce`, `clientTimestamp`.
2. The Edge Worker validates:
   - Nonce & timestamp against replay attack window (2 minutes).
   - Application existence and `applicationPaused` status.
   - Version match (`appVersion === serverVersion`).
   - Username and password against `applications/${secret}/${appName}/users/${username}`.
   - Account ban status (`isBanned`).
   - Expiry date (`expiry`).
   - HWID lock status (`hwidLock`). If HWID is unassigned (`""`), it automatically locks to the first reported `hwid`. If HWID is locked and doesn't match incoming `hwid`, it returns `HWID_MISMATCH`.
3. **One-Time Account Self-Destruct**: If `userData.oneTime === true`, successful authentication immediately deletes the user record from `applications/${secret}/${appName}/users/${username}` after logging in.
4. Worker returns an RSA-256 digitally signed JSON payload containing `LOGIN_SUCCESS`, user subscription level, and expiry date.

### 3. Reseller Authentication (`ResellerPortal.tsx`)
- Resellers do not use Firebase Auth.
- Instead, access is granted via a unique URL route containing a secure hash (`/reseller/:hash`).
- The portal checks credentials against the encrypted payload stored at `resellers/${hash}`.
- Successful authentication stores a session key in `localStorage` (`reseller_auth_${hash}`).

---

## 6. Customer Flow

```
[ Developer Registration ] ──> [ Obtains DXA-Secret Key ]
                                       │
                                       ▼
                     [ Customer Dashboard (/dashboard) ]
                                       │
         ┌─────────────────────────────┼─────────────────────────────┐
         ▼                             ▼                             ▼
[ Create Application ]       [ Manage Users/Licenses ]    [ Define Remote Vars ]
         │                             │                             │
         ▼                             ▼                             ▼
[ Configure Version &     [ Generate License Keys &      [ Secure Key-Value Config
   Pause Status ]            HWID Reset Controls ]           Pushed to Clients ]
```

### Dashboard Tabs (`Dashboard.tsx`)
- **Overview**: Active plan indicator, resource usage counters (Apps, Users, Licenses, Variables), quick copy secret key.
- **Applications**: Create new app, set version, toggle pause state, view app-specific metadata, delete application. Onboarding modal features explicit close (`X`) button and "Skip for now" options.
- **Users**: List all registered end-users, create direct users, reset HWID, toggle ban status, set expiration dates, support `oneTime` temporary access keys.
- **Licenses**: Generate batch license keys with customizable expiry, ranks, and notes. View unused vs used keys.
- **Variables**: Store encrypted remote variables accessible by clients via `/getvariable` or `/getvariables`.
- **Webhooks**: Configure Discord webhook notifications (`url`, `notifyLogin`, `notifyAddUser`, `notifyDeleteUser`, `notifyAddLicense`, `notifyExpireLicense`, `notifyPauseApp`).
- **Resellers**: Issue reseller credentials, set user/license limits, assign allowed applications.
- **Earn / Rewards**: Daily check-in rewards, weekly bonuses, Discord boost claim integration for earning free system credits.
- **Payment Verification**: Payment proof submissions enforce validation requiring either a screenshot proof image or transaction reference note before allowing upload.

---

## 7. Admin Flow

Access to `/admin` is locked to `deepsrajput1101@gmail.com` (`ADMIN_EMAIL`).

### Super-Admin Capabilities (`Admin.tsx`)
1. **Customer Management**: View all platform customers, edit plan levels, manually alter credit balances, adjust subscription statuses, or delete customer accounts (which cascades to delete all their applications).
2. **Infrastructure Plan Management**: Create, edit, clone, or delete platform plans (`Free Plan`, `Developer`, `Pro`, `Enterprise`). Define limits for apps, users, variables, webhooks, resellers, and credit pricing.
3. **Credit Requests & Payment Fulfillment**: Review pending user top-up requests (`system/creditRequests`), inspect transaction notes and uploaded payment screenshots, approve (automatically credits user account) or reject requests.
4. **Payment Configuration**: Edit global payment instructions, update UPI ID, upload QR Code image URL, configure credit package tiers.
5. **SDK Repository**: Add, edit, toggle visibility, and update SDK code templates for all supported programming languages.
6. **System Control**: Toggle Maintenance Mode globally (`system/config/maintenanceMode`), forcing non-admin users to a maintenance screen.
7. **Audit Logging**: System plan changes automatically write encrypted records to `system/planAuditLogs/`.

---

## 8. Database Structure

Firebase Realtime Database nodes store data in JSON format. Because Firebase keys cannot contain `.` characters, all email addresses used as keys replace `.` with `,` (e.g., `user@domain.com` -> `user@domain,com`).

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
│       └── ${notificationId}/          # InAppNotification object (title, message, type, read)
│
├── applications/
│   └── ${userSecret}/                  # Customer's DXA Secret
│       └── ${appName}/                 # Application name (e.g., "MyGame")
│           ├── metadata/               # Encrypted metadata object
│           │   ├── version: string     # e.g., "1.0.4"
│           │   ├── applicationPaused: boolean
│           │   └── created: ISO string
│           ├── users/
│           │   └── ${username}/        # Encrypted user object
│           │       ├── password: string
│           │       ├── hwidLock: boolean
│           │       ├── sid: string     # Client HWID string
│           │       ├── isBanned: boolean
│           │       ├── expiry: string  # Date string or "lifetime"
│           │       ├── oneTime: boolean# Auto-deleted upon first login
│           │       └── subscription: string
│           ├── licenses/
│           │   └── ${licenseKey}/      # Encrypted license object
│           │       ├── used: boolean
│           │       ├── rank: string
│           │       ├── expiry: string
│           │       └── associatedUser: string
│           └── variables/
│               └── ${varName}/         # Encrypted string variable value
│
├── webhookSettings/
│   └── ${userSecret}/                  # WebhookSettings object
│       ├── url: string                 # Discord Webhook URL
│       ├── notifyLogin: boolean
│       ├── notifyAddUser: boolean
│       ├── notifyDeleteUser: boolean
│       ├── notifyAddLicense: boolean
│       ├── notifyExpireLicense: boolean
│       └── notifyPauseApp: boolean
│
├── resellers/
│   └── ${hash}/                        # Secure reseller URL hash
│       ├── createdBy: string           # Creator email key
│       └── payload: string             # AES encrypted Reseller object:
│                                       # { username, passwordHash, hash, allowedApps,
│                                       #   userLimit, usersCreated, licensesCreated, panelName }
│
├── resellerWebhooks/
│   └── ${hash}/                        # Reseller WebhookSettings object
│
└── system/
    ├── config/                         # SystemConfig object
    │   ├── maintenanceMode: boolean
    │   ├── maintenanceMessage: string
    │   └── featureRestrictions: Record<string, FeatureRestriction>
    ├── plans/
    │   └── ${planName}/                # SystemPlan object (Free, Developer, Pro, etc.)
    ├── planAuditLogs/
    │   └── ${logId}/                   # Encrypted PlanAuditLog object
    ├── creditPackages/
    │   └── ${packageId}/               # CreditPackage object
    ├── paymentConfig/                  # PaymentConfig object (UPI ID, QR URL)
    ├── creditRequests/
    │   └── ${reqId}/                   # CreditTopUpRequest object
    ├── sdks/
    │   └── ${sdkId}/                   # SDK object
    ├── subscriptionEvents/
    │   └── ${eventId}/                 # SubscriptionLifecycleEvent object
    └── stats/                          # System-wide metrics (totalUsers, totalApps, etc.)
```

---

## 9. Firebase Structure & Security Rules

The `firebase-rules.json` file enforces database security rules:

```json
{
  "rules": {
    "system": {
      "config": {
        ".read": true,
        ".write": "auth != null && (auth.token.admin === true || auth.token.role === 'admin' || auth.token.email.toLowerCase() === 'deepsrajput1101@gmail.com')"
      },
      "plans": { ".read": true, ".write": "admin_only" },
      "stats": { ".read": true, ".write": "admin_or_worker" },
      "sdks": { ".read": true, ".write": "admin_only" },
      "creditPackages": { ".read": true, ".write": "admin_only" },
      "paymentConfig": { ".read": true, ".write": "admin_only" },
      "creditRequests": { ".read": "auth != null", ".write": "auth != null" },
      "planAuditLogs": { ".read": "admin_only", ".write": "admin_only" },
      "subscriptionEvents": { ".read": "auth != null", ".write": "auth != null" }
    },
    "customerNotifications": {
      "$emailKey": { ".read": "auth != null", ".write": "auth != null" }
    },
    "customers": {
      ".read": "admin_only",
      "$emailKey": {
        ".read": "admin_or_owner",
        ".write": "admin_or_owner",
        "secret": {
          ".validate": "admin_only || !data.exists() || data.val() === newData.val()"
        }
      }
    },
    "applications": {
      "$userSecret": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "webhookSettings": {
      "$userSecret": {
        ".read": "admin_or_owner",
        ".write": "admin_or_owner"
      }
    },
    "resellers": {
      ".indexOn": ["createdBy"],
      "$hash": {
        ".read": "admin_or_reseller_or_creator",
        ".write": "admin_or_reseller_or_creator",
        ".validate": "newData.hasChildren(['createdBy', 'payload'])"
      }
    },
    "resellerWebhooks": {
      "$hash": {
        ".read": "admin_or_reseller_or_creator",
        ".write": "admin_or_reseller_or_creator"
      }
    }
  }
}
```

---

## 10. API Reference

All API requests are routed through the Cloudflare Worker (`functions/[[route]].js` or `src/index.js`).

### Base URL
- Production Edge API: `https://<your-worker-domain>.workers.dev` or `/api` via Cloudflare Pages Functions.

### 1. `POST /login`
Authenticates a user for a specific application.
- **Request Body**:
  ```json
  {
    "username": "john_doe",
    "password": "secretpassword",
    "secret": "DXA-XXXXXX",
    "appName": "MyGame",
    "appVersion": "1.0",
    "hwid": "BFEBFBFF000906EA-123456",
    "clientNonce": "random_16_char_nonce",
    "clientTimestamp": "1720000000"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "success": true,
    "message": "LOGIN_SUCCESS",
    "username": "john_doe",
    "subscription": "default",
    "expiry": "lifetime",
    "signature": "Base64SignedRSASignatureString..."
  }
  ```
- **Special Behavior**: If user has `oneTime: true`, user record is automatically deleted after successful login.
- **Possible Errors**: `Missing required fields` (400), `Application not found` (404), `APPLICATION_PAUSED` (403), `VERSION_MISMATCH` (409), `Invalid credentials` (401), `USER_BANNED` (403), `HWID_MISMATCH` (403), `LICENSE_EXPIRED` (403), `TOO_MANY_REQUESTS` (429).

### 2. `POST /register`
Registers a new user using a valid License Key.
- **Request Body**: `{ username, password, licenseKey, secret, appName, appVersion, hwid, clientNonce, clientTimestamp }`
- **Response** (200 OK): `{ "success": true, "message": "REGISTER_SUCCESS" }`
- **Errors**: `Username taken` (409), `Invalid or used License` (404/409).

### 3. `POST /versioncheck`
Checks client software version against server version.
- **Request Body**: `{ secret, appName, appVersion }`
- **Response**: `{ "success": true, "message": "VERSION_OK", "serverVersion": "1.0" }`

### 4. `POST /isapplicationpaused`
Checks if the target application is paused by the developer.
- **Request Body**: `{ secret, appName }`
- **Response**: `{ "success": true, "message": "APPLICATION_ACTIVE" }` or `"APPLICATION_PAUSED"`

### 5. `POST /getvariable`
Retrieves a specific encrypted remote variable value.
- **Request Body**: `{ secret, appName, appVersion, varName }`
- **Response**: `{ "success": true, "message": "VARIABLE_FOUND", "value": "decrypted_var_value" }`

### 6. `POST /getvariables`
Retrieves all remote variables for an application.
- **Request Body**: `{ secret, appName }`
- **Response**: `{ "success": true, "message": "VARIABLES_FOUND", "variables": { "KEY1": "VAL1" } }`

### 7. Management Endpoints (Owner Authorized)
- `POST /create_app` -> `{ ownerEmailKey, secret, appName }`
- `POST /delete_app` -> `{ ownerEmailKey, secret, appName }`
- `POST /create_user` -> `{ ownerEmailKey, username, password, secret, appName, appVersion, hwid, expiry, subscription, hwidLock, oneTime }`
- `POST /delete_user` -> `{ ownerEmailKey, secret, appName, username }`
- `POST /reset_hwid` -> `{ secret, appName, username }`
- `POST /create_license` -> `{ ownerEmailKey, secret, appName, licenseKey, rank, expiry, note }`
- `POST /delete_license` -> `{ ownerEmailKey, secret, appName, licenseKey }`

---

## 11. Cloudflare Workers

The backend is built on **Hono** and executes on Cloudflare Workers / Cloudflare Pages Functions (`functions/[[route]].js`).

### Core Edge Features
1. **Firebase REST Token Manager**: `getFirebaseToken(env)` requests an ID token from `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword` and caches it in memory until expiration, enabling high-performance REST database calls.
2. **In-Memory Rate Limiting**: `isRateLimited(ip)` restricts requests to **10 requests per minute per IP address**. Excessive calls return status `429 TOO_MANY_REQUESTS`.
3. **Anti-Replay Nonce Engine**: `validateSdkRequest(body, endpoint)` caches `clientNonce` strings in `sdkNonceCache` for 2 minutes (`SDK_MAX_REQUEST_AGE_MS = 120000`). If a nonce is reused or `clientTimestamp` drifts past 120 seconds, the request is rejected with `REPLAY_BLOCKED` or `STALE_REQUEST`.
4. **RSA-256 Digital Response Signing**:
   - Private Key PEM: `DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM`
   - Algorithm: `RSASSA-PKCS1-v1_5` with `SHA-256` hashing
   - **Canonical Digest Format**:
     ```
     endpoint=<SHA256_HEX(endpoint)>
     requestNonce=<SHA256_HEX(requestNonce)>
     serverTimestamp=<SHA256_HEX(serverTimestamp)>
     success=1|0
     message=<SHA256_HEX(message)>
     username=<SHA256_HEX(username)>
     subscription=<SHA256_HEX(subscription)>
     expiry=<SHA256_HEX(expiry)>
     serverVersion=<SHA256_HEX(serverVersion)>
     value=<SHA256_HEX(value)>
     variables=<SHA256_HEX(sorted_key_value_lines)>
     ```
   - Signs the formatted string using Web Crypto (`crypto.subtle.sign`) and returns base64 string in `signature` field.

---

## 12. Services

Located in `services/`:

- **`subscriptionService.ts`**: Evaluates plan lifecycles, trial grace periods (7 days), renewal warnings, auto-downgrades to Free Plan, feature permission checks (`hasFeaturePermission`), and admin subscription overrides (`adminExtendSubscription`, `adminSuspendSubscription`, `adminRestoreSubscription`). Logs events to `/system/subscriptionEvents`.
- **`sdkService.ts`**: Subscribes to realtime SDK changes (`/system/sdks`), seeds default SDK code templates (Python, C#, C++, Java, Rust, Go, TypeScript), and handles saving/deleting/toggling SDK visibility.
- **`encryption.ts`**: Implements AES encryption/decryption using `CryptoJS.AES`. Provides automatic fallbacks during decryption (`customSecret` -> `DB_SECRET` -> hardcoded fallback `"MyDeepXAuthSecretKey_2026!#"`).
- **`firebase.ts`**: Re-exports initialized Firebase Auth and Database instances.
- **`toastService.ts`**: Event bus (`window.dispatchEvent`) for triggering global UI toast notifications.

---

## 13. Components

Located in `components/`:

- **`BrandMark.tsx`**: Animated brand icon/logo supporting size variants (`compact`, `default`, `lg`).
- **`CreditPricingPanel.tsx`**: Admin panel grid for configuring credit packages and prices in INR.
- **`CursorGlow.tsx`**: Radial gradient background glow that tracks mouse movement across the screen.
- **`LoadingScreen.tsx`**: Fullscreen loading spinner with pulsing rings and brand logo.
- **`SkeletonLoader.tsx`**: Shimmering layout placeholders (`SkeletonCard`, `SkeletonTable`, `SkeletonStats`).
- **`Toast.tsx`**: Fixed bottom-right toast message container with entering/exiting CSS animations.
- **`Turnstile.tsx`**: Wrapper component for Cloudflare Turnstile anti-bot CAPTCHA widget.

---

## 14. Routes

Defined in `App.tsx` using `react-router-dom`:

| Path | Component | Description | Access |
|---|---|---|---|
| `/` | `Landing` | Homepage, features, pricing preview, CTA | Public |
| `/login` | `Login` | Customer & Admin login screen | Public |
| `/signup` | `Signup` | Developer registration screen | Public |
| `/forgot-password` | `ForgotPassword` | Password recovery page | Public |
| `/dashboard` | `Dashboard` | App management, users, licenses, vars | Customer |
| `/admin` | `Admin` | Platform management control panel | Admin Only |
| `/shop` | `Shop` | Plan subscriptions & credit top-up store | Customer |
| `/reseller/:hash` | `ResellerPortal` | Reseller user & key management portal | Reseller Hash |
| `/docs` | `Docs` | Complete documentation & interactive API cards | Public |
| `/tos` | `TOS` | Terms of Service & Privacy Policy | Public |
| `*` | `NotFound` | 404 Fallback view | Public |

---

## 15. Hooks

- Standard React hooks (`useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`) are used extensively across all pages.
- `useParams` reads the `:hash` param in `ResellerPortal.tsx`.
- `useNavigate` and `useLocation` manage client-side page routing.
- Custom listener patterns: `onValue` from `firebase/database` is used inside `useEffect` hooks for real-time synchronization.

---

## 16. Utilities

- **Encryption Utils** (`services/encryption.ts`): `encrypt(payload, customSecret?)` & `decrypt(ciphertext, customSecret?)`.
- **Toast Utils** (`services/toastService.ts`): `showToast(message, type)`.
- **String Generators**: Random hex generators for customer secret creation (`DXA-${hex}`).
- **Date Formatting & Time Utils**: Conversion to locale string, timestamp comparisons, and grace period calculations in `subscriptionService.ts`.

---

## 17. SDK System

DeepXAuth provides native SDK implementations and templates for 7 primary programming languages (`sdkService.ts`):

1. **Python**: Native HWID via `wmic csproduct get uuid`, HTTP requests using `urllib.request` / `requests`.
2. **C# (.NET)**: Uses `ManagementObjectSearcher` for HWID, `HttpClient` for API requests.
3. **C++ (Native)**: Win32 API / `wmic` call, `winhttp.h` or `curl` for HTTPS requests.
4. **Java**: `Runtime.getRuntime().exec("wmic...")`, `java.net.http.HttpClient`.
5. **Rust**: `std::process::Command` executing system UUID calls, `reqwest` crate.
6. **Go**: `os/exec` command execution, `net/http` standard library.
7. **TypeScript / Node.js**: `child_process.execSync`, `fetch` API.

### Response Signature Verification
Every SDK verifies the `signature` returned by the server against `txa-response-signing-public.pem` using RSA-SHA256 before trusting response fields (`success`, `expiry`, `subscription`).

---

## 18. Subscription Engine

Managed by `services/subscriptionService.ts`.

### Subscription Statuses (`SubscriptionStatus`)
- **`trial`**: Initial test period.
- **`active`**: Fully paid, active subscription.
- **`renewing`**: Near expiry date (within 7 days of expiration).
- **`grace_period`**: Expired, but within 7-day grace period (restricted access).
- **`expired`**: Fully expired, pending downgrade.
- **`downgraded`**: Automatically downgraded to Free Plan (`autoDowngrade: true`).
- **`cancelled`**: Cancelled by customer.
- **`suspended`**: Suspended by Super-Admin.

### Subscription Lifecycle Flow
```
[ Active ] ──(Expires)──> [ Grace Period (7 Days) ] ──(Unpaid)──> [ Auto-Downgraded to Free ]
    │                             │
    └───────(Renews Payment)──────┴────────> [ Active ]
```

---

## 19. Credit System

- **Credits** act as the platform's internal currency for feature usage and plan purchasing.
- **Credit Packages**: Admin defines credit tiers (`CreditPackage`) in `CreditPricingPanel.tsx`. Default packages include:
  - **Starter Pack**: 500 Credits
  - **Developer Pack**: 1,500 Credits (Popular)
  - **Pro Pack**: 5,000 Credits
  - **Enterprise Pack**: 15,000 Credits
- **Purchase Workflow**:
  1. Customer selects package on `/shop`.
  2. Customer sends payment via UPI ID or QR Code.
  3. Customer submits transaction details & Base64 screenshot proof (`CreditTopUpRequest`).
  4. Super-Admin approves request in `/admin`, immediately crediting `customers/${emailKey}.credits`.

---

## 20. Infrastructure Plans

Plans define system resource quotas and capabilities (`types.ts` -> `SystemPlan`):

| Plan Attribute | Description | Default / Unlimited |
|---|---|---|
| `maxApps` | Maximum applications customer can create | e.g. 1 to Unlimited (-1) |
| `maxUsers` | Maximum end-users per application | e.g. 100 to Unlimited (-1) |
| `maxVariables` | Maximum remote variables per app | e.g. 5 to Unlimited (-1) |
| `maxCloudVars` | Maximum cloud variables | Numerical limit |
| `maxWebhooks` | Maximum active webhook integrations | Numerical limit |
| `maxResellers` | Maximum reseller accounts customer can issue | Numerical limit |
| `visibility` | Plan visibility state | `Public`, `Hidden`, `Beta`, `Coming Soon`, `Deprecated`, `Archived` |
| `autoDowngrade` | Auto downgrade to Free Plan when subscription ends | `true` / `false` |

---

## 21. Security

1. **Hardware ID (HWID) Locking**: Prevents credential sharing by locking user accounts to client hardware signatures.
2. **Bot Protection**: Cloudflare Turnstile integration on authentication forms (`Login`, `Signup`, `ForgotPassword`).
3. **Anti-Replay Attack Protection**: Nonce verification (`clientNonce`) with strict timestamp window check (`120 seconds`).
4. **Anti-Tamper Digital Signatures**: RSASSA-PKCS1-v1_5 signatures on all SDK responses.
5. **Worker Rate Limiting**: Max 10 requests per minute per IP.
6. **Encrypted Realtime Database**: Sensitive fields stored AES encrypted at rest.
7. **Maintenance Mode Guard**: Blocks non-admin Web UI navigation when `system/config/maintenanceMode === true`.

---

## 22. Encryption

Encryption is powered by `CryptoJS.AES` (`services/encryption.ts`).

### Logic
- **`encrypt(data, secret)`**: Serializes `data` to JSON string and encrypts it using the secret.
- **`decrypt(ciphertext, secret)`**: Decrypts `ciphertext`.
- **Multi-Key Decryption Fallback**:
  ```javascript
  // Decryption tries keys in sequence:
  1. customSecret (if provided)
  2. DB_SECRET (from environment)
  3. Fallback Key ("MyDeepXAuthSecretKey_2026!#")
  ```

---

## 23. Important Constants

From `constants.ts`:

- `ADMIN_EMAIL`: `"deepsrajput1101@gmail.com"`
- `DEFAULT_CREDIT_PACKAGES`: Pre-populated credit package pricing structures.
- `SubscriptionConfig`:
  - `GRACE_PERIOD_DAYS`: 7
  - `RENEWAL_WARNING_DAYS`: 7
  - `DAYS_PER_MONTH`: 30
  - `DAYS_PER_YEAR`: 365

---

## 24. Environment Variables

### Frontend Environment (`.env` / `env.d.ts`)
- `VITE_FIREBASE_API_KEY`: Firebase API Key
- `VITE_FIREBASE_PROJECT_ID`: Firebase Project ID
- `VITE_TURNSTILE_SITE_KEY`: Cloudflare Turnstile Site Key

### Backend Environment (`.dev.vars` / Cloudflare Secrets)
- `DB_SECRET`: AES encryption key for database nodes
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile Secret Key for verifying CAPTCHA tokens
- `DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM`: RSA 2048-bit Private Key for signing worker responses
- `FIREBASE_API_KEY`: Firebase Web API Key for worker auth requests
- `FIREBASE_DB_URL`: Realtime Database URL (`https://<project-id>-default-rtdb.firebaseio.com`)
- `FIREBASE_AUTH_EMAIL`: Service account email for worker database access
- `FIREBASE_AUTH_PASSWORD`: Service account password for worker database access

---

## 25. External Integrations

1. **Firebase Authentication & Realtime Database**: Core data store and user identity service.
2. **Cloudflare Workers & Pages**: Global edge API execution environment.
3. **Cloudflare Turnstile**: Smart CAPTCHA anti-bot verification.
4. **Monaco Editor**: Embedded VS Code-like editor for viewing code snippets in Docs and Admin.
5. **Discord Webhooks**: Live event notifications for logins, user creation, license redemption, app pause status, and reseller activity.

---

## 26. Build Process

Defined in `package.json`:

```bash
# 1. Local Development Server
npm run dev

# 2. Production Build (Vite compiles output to /dist)
npm run build

# 3. Local Preview of Production Build
npm run preview
```

---

## 27. Deployment

```bash
# 1. Deploy Frontend to Cloudflare Pages
npm run deploy:pages

# 2. Deploy API Worker to Cloudflare Workers
npm run deploy:api
```

*Note*: Cloudflare Pages Functions automatically deploy `functions/[[route]].js` when pushing updates to Pages.

---

## 28. Coding Patterns

1. **Encrypted Realtime Storage Pattern**:
   ```typescript
   // Reading encrypted data
   const snap = await get(ref(db, `applications/${secret}/${appName}/users/${username}`));
   const user = decrypt(snap.val());

   // Writing encrypted data
   await set(ref(db, `applications/${secret}/${appName}/users/${username}`), encrypt(updatedUser));
   ```
2. **Email Key Sanitization Pattern**:
   ```typescript
   const emailKey = email.toLowerCase().replace(/\./g, ',');
   ```
3. **Sub-Tab Navigation Pattern**: Controlled via local string states (e.g. `const [activeTab, setActiveTab] = useState('users')`).

---

## 29. Reusable Components

- `<BrandMark size="compact" />` -> Animated application brand mark.
- `<SkeletonCard />`, `<SkeletonTable />` -> Shimmer loading states.
- `<Turnstile siteKey={...} onVerify={...} />` -> CAPTCHA widget.
- `<Toast />` -> Centralized notification UI.

---

## 30. Common Workflows

### Workflow A: End-to-End User Authentication via C# App
1. Developer creates app `GameLauncher` in `/dashboard`.
2. Developer generates License Key `DXA-KEY-1234`.
3. End-user downloads C# Client App built with DXA SDK.
4. End-user registers with username `player1` and license key `DXA-KEY-1234`.
5. C# App sends `POST /register` -> Worker binds HWID, sets license `used: true`, creates user in DB.
6. Subsequent launches send `POST /login` -> Worker verifies HWID, signs response with RSA private key, C# SDK verifies signature with RSA public key, launches game.

---

## 31. Project Conventions

- **File Naming**: PascalCase for React components and pages (`Admin.tsx`, `Dashboard.tsx`), camelCase for services and utilities (`encryption.ts`, `sdkService.ts`).
- **Database Key Format**: Email keys replace `.` with `,`. Customer secrets start with `DXA-`.
- **CSS Styling**: Pure Vanilla CSS relying on CSS variable tokens in `index.css`. Glassmorphism effects use `.glass-card-premium` and `.glass-reflection`.

---

## 32. Current Known Issues

1. **`deploy:api` Script Path**: `package.json` script `"deploy:api": "cd api && npm install && wrangler deploy"` targets an `api/` directory, whereas worker scripts are located in `functions/[[route]].js` and `src/index.js`.
2. **Hardcoded Admin Email**: Admin access control is hardcoded to `deepsrajput1101@gmail.com` across `Admin.tsx`, `constants.ts`, and `firebase-rules.json`.
3. **Fallback Database Secret**: `encryption.ts` and `functions/[[route]].js` contain fallback secret string `"MyDeepXAuthSecretKey_2026!#"` when `DB_SECRET` is undefined.

---

## 33. TODOs

- [ ] Standardize API deployment scripts between Cloudflare Pages Functions (`functions/[[route]].js`) and standalone Worker (`src/index.js`).
- [ ] Transition admin privilege check from hardcoded email string to Firebase Auth Custom User Claims (`auth.token.admin === true`).
- [ ] Move hardcoded fallback encryption secret into strictly required environment variable validation.

---

## 34. Future Improvements

- **Automated Payment Gateway**: Integrate Stripe / Razorpay Webhooks for instant credit top-up and subscription activation without manual admin screenshot review.
- **WebSocket / Server-Sent Events (SSE)**: Implement live streaming audit notifications for security events in the Admin panel.
- **Package Manager SDKs**: Publish official SDK packages to NuGet (`DeepXAuth.NET`), PyPI (`deepxauth`), and Crates.io (`deepxauth-rs`).

---

## 35. Glossary

- **DXA**: DeepXAuth platform acronym.
- **Customer Secret**: A unique developer API identifier formatted as `DXA-XXXXXX`.
- **HWID**: Hardware Identification string uniquely identifying a client device.
- **Reseller Hash**: A cryptographic URL parameter used for reseller authentication and multi-tenant portal access.
- **Grace Period**: A 7-day post-expiration window where customer data is retained before automated plan downgrade.
- **Turnstile**: Cloudflare's privacy-focused anti-bot CAPTCHA alternative.
- **Hono**: Ultrafast web framework for Cloudflare Workers.
