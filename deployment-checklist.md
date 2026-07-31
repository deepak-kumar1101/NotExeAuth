# DeepXAuth (DXA) Production Deployment Checklist (`deployment-checklist.md`)

> **Document Status**: Production Readiness Manual Verification Checklist  
> **Target System**: DeepXAuth Security SaaS Platform  
> **Instructions**: Check off each `[ ]` item manually prior to promoting to production.

---

## Table of Contents
1. [Frontend Deployment & Build](#1-frontend-deployment--build)
2. [Backend & Cloudflare Workers](#2-backend--cloudflare-workers)
3. [Firebase Authentication & Realtime Database](#3-firebase-authentication--realtime-database)
4. [Environment Variables & Secrets Provisioning](#4-environment-variables--secrets-provisioning)
5. [Security, Cryptography & Rate Limiting](#5-security-cryptography--rate-limiting)
6. [Domains, SSL/HTTPS & CDN Config](#6-domains-sslhttps--cdn-config)
7. [Shop, Credit System & Subscriptions](#7-shop-credit-system--subscriptions)
8. [Reseller Multitenant Portal](#8-reseller-multitenant-portal)
9. [SDK System & RSA Public Key Sync](#9-sdk-system--rsa-public-key-sync)
10. [Discord Webhooks & Notifications](#10-discord-webhooks--notifications)
11. [Super Admin Console & Audit Controls](#11-super-admin-console--audit-controls)
12. [Monitoring, Logging & Database Backups](#12-monitoring-logging--database-backups)
13. [Pre-Flight End-to-End Testing](#13-pre-flight-end-to-end-testing)

---

## 1. Frontend Deployment & Build

- [ ] **TypeScript Type Validation**: Run `npx tsc --noEmit` and confirm 0 compilation errors.
- [ ] **Vite Production Build**: Execute `npm run build` and ensure `dist/` directory generates without bundle errors.
- [ ] **Asset Optimization**: Verify CSS, JavaScript, and font assets are minified and compressed.
- [ ] **Favicon & Meta Tags**: Verify site title, meta description, and SVG brand icons load cleanly.
- [ ] **Client Routing**: Verify React Router fallback routes function on page refresh (`_redirects` or Cloudflare SPA configuration).

---

## 2. Backend & Cloudflare Workers

- [ ] **Wrangler Configuration**: Verify `wrangler.toml` references the correct production Worker name (`deepxauth-cfire`).
- [ ] **Route Handler Sync**: Confirm `functions/[[route]].js` and `src/index.js` routes are synchronized.
- [ ] **Serverless Deployment**: Execute `npx wrangler deploy` to push the worker engine to Cloudflare edge.
- [ ] **Edge Health Check**: Verify `GET https://<your-worker-domain>.workers.dev/` returns `"Deep X Auth API is Active."`.

---

## 3. Firebase Authentication & Realtime Database

- [ ] **Firebase Rules Deployment**: Copy contents of `firebase-rules.json` to Firebase Console -> Realtime Database -> Rules and click **Publish**.
- [ ] **Database Indexing**: Verify `.indexOn: ["createdBy"]` rule is active on `/resellers`.
- [ ] **Auth Providers**: Confirm Email/Password authentication is enabled under Firebase Console -> Authentication -> Sign-in method.
- [ ] **Service Account User**: Confirm dedicated worker service account (`FIREBASE_AUTH_EMAIL`) exists in Firebase Auth.
- [ ] **Authorized Domains**: Add production web domain to Firebase Console -> Authentication -> Settings -> Authorized Domains.

---

## 4. Environment Variables & Secrets Provisioning

### Frontend Secrets (`.env` / Hosting Provider)
- [ ] `VITE_FIREBASE_API_KEY`: Set to valid production Firebase Web API Key.
- [ ] `VITE_FIREBASE_PROJECT_ID`: Set to production Firebase Project ID.
- [ ] `VITE_TURNSTILE_SITE_KEY`: Set to Cloudflare Turnstile public site key.

### Edge Worker Secrets (`wrangler secret put`)
- [ ] `wrangler secret put DB_SECRET`: Set production AES-256 master key.
- [ ] `wrangler secret put DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM`: Provision RSA 2048-bit private key.
- [ ] `wrangler secret put TURNSTILE_SECRET_KEY`: Provision Cloudflare Turnstile secret key.
- [ ] `wrangler secret put FIREBASE_API_KEY`: Provision Firebase REST Web API key.
- [ ] `wrangler secret put FIREBASE_DB_URL`: Set production Firebase Realtime Database URL.
- [ ] `wrangler secret put FIREBASE_AUTH_EMAIL`: Provision Worker service account email.
- [ ] `wrangler secret put FIREBASE_AUTH_PASSWORD`: Provision Worker service account password.

---

## 5. Security, Cryptography & Rate Limiting

- [ ] **RSA Private Key Separation**: Confirm `DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM` is stored solely in Worker secrets and never exposed in frontend code.
- [ ] **RSA Public Key Deployment**: Confirm `public/txa-response-signing-public.pem` matches the production private key.
- [ ] **AES Payload Encryption**: Verify `encrypt()` and `decrypt()` produce encrypted database nodes at rest.
- [ ] **Anti-Replay Nonce Engine**: Test that `validateSdkRequest` rejects requests older than 120 seconds or with reused nonces.
- [ ] **IP Rate Limiting**: Verify IP rate limiter returns HTTP `429` after 10 requests/minute per IP.
- [ ] **CAPTCHA Protection**: Test Cloudflare Turnstile verification on Login and Registration forms.

---

## 6. Domains, SSL/HTTPS & CDN Config

- [ ] **Custom Domain Binding**: Bind custom domain in Cloudflare Pages / Workers settings.
- [ ] **SSL/TLS Mode**: Ensure SSL/TLS encryption mode is set to **Full (Strict)** in Cloudflare Console.
- [ ] **Always Use HTTPS**: Enable automatic HTTP-to-HTTPS redirect rule.
- [ ] **Security Headers**: Configure HTTP response headers (`Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`).

---

## 7. Shop, Credit System & Subscriptions

- [ ] **Catalog Seeding**: Seed default credit packages in database using "Reset to Defaults" in Admin panel.
- [ ] **Payment Config**: Verify active UPI ID and QR code URL in Admin -> Payment & QR Config.
- [ ] **Credit Top-Up Request**: Verify customer payment proof form (`Shop.tsx`) enforces screenshot or transaction note validation.
- [ ] **Credit Approval Engine**: Test Admin approval of credit requests (`Admin.tsx`), verifying credit balance increments.
- [ ] **Subscription Lifecycle**: Verify 7-day grace period and auto-downgrade logic in `subscriptionService.ts`.

---

## 8. Reseller Multitenant Portal

- [ ] **Reseller Creation**: Create test reseller in Developer Dashboard (`/dashboard` -> Resellers tab).
- [ ] **Portal Authentication**: Access `/reseller/:hash` using reseller hash URL and verify authentication.
- [ ] **Quota Enforcement**: Verify reseller cannot generate licenses or create users beyond assigned quota limits.
- [ ] **Application Isolation**: Confirm reseller can only view and manage assigned applications (`allowedApps`).

---

## 9. SDK System & RSA Public Key Sync

- [ ] **SDK Template Generation**: Verify SDK generator (`services/sdkService.ts`) injects correct API host URL.
- [ ] **Public Key Embedding**: Confirm generated SDKs download or reference `txa-response-signing-public.pem`.
- [ ] **Supported Languages Verification**: Verify code templates for Python, C#, C++, Rust, Go, and TypeScript.
- [ ] **Native Signature Verification**: Test native SDK login with signature verification enabled.

---

## 10. Discord Webhooks & Notifications

- [ ] **Developer Webhooks**: Test Discord webhook notification triggers for user registration and license key creation.
- [ ] **Reseller Webhooks**: Test reseller-specific webhooks (`/resellerWebhooks/${hash}`).
- [ ] **In-App Notifications**: Confirm notifications write to `/customerNotifications/${emailKey}` upon payment submission.

---

## 11. Super Admin Console & Audit Controls

- [ ] **Admin Account Lock**: Confirm `ADMIN_EMAIL` (`deepsrajput1101@gmail.com`) is set correctly in `constants.ts`.
- [ ] **Maintenance Mode Switch**: Test toggling maintenance mode in Admin -> Config and verify message banner.
- [ ] **Plan Editor Modal**: Verify creating, editing, and saving system plans (`system/plans`).
- [ ] **Audit Logs**: Verify plan updates write to `/system/planAuditLogs`.

---

## 12. Monitoring, Logging & Database Backups

- [ ] **Firebase Automated Backups**: Enable automated daily backups under Firebase Console -> Realtime Database -> Backups.
- [ ] **Cloudflare Worker Analytics**: Enable Worker error logging and request rate monitoring in Cloudflare Console.
- [ ] **Error Boundary**: Verify React Error Boundary catches unexpected UI runtime exceptions gracefully.

---

## 13. Pre-Flight End-to-End Testing

- [ ] **Customer Registration & Login**: Test signup, login, secret key login, and password reset flows.
- [ ] **Application Lifecycle**: Create app, toggle version, pause app, and delete app.
- [ ] **User & License Lifecycle**: Create user, generate batch licenses, activate license via SDK, and reset HWID.
- [ ] **Shop & Top-Up Portal**: Submit credit request proof, approve in Admin, and verify updated credit balance.
- [ ] **Reseller Flow**: Log in via reseller hash, issue user account, and verify quota decrements.
- [ ] **Worker API Direct Test**: Execute sample `POST /login` request via cURL or Postman and verify RSA `signature` in response.
