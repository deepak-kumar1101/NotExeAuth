import { Hono } from 'hono';
import { handle } from 'hono/cloudflare-pages';
import CryptoJS from 'crypto-js';

const app = new Hono();

app.get('/', async (c) => {
    if (c.env && c.env.ASSETS) {
        return c.env.ASSETS.fetch(c.req.raw);
    }
    return c.text('Deep X Auth API is Active.', 200);
});

const encrypt = (data, secret) => {
    if (!data) return data;
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(str, secret).toString();
};

const decrypt = (ciphertext, secret) => {
    if (!ciphertext || typeof ciphertext !== 'string') return ciphertext;
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return ciphertext;
        try {
            return JSON.parse(decrypted);
        } catch (e) {
            return decrypted;
        }
    } catch (e) {
        return ciphertext;
    }
};

const ipLimits = new Map();
function isRateLimited(ip) {
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 10;
    
    if (!ipLimits.has(ip)) {
        ipLimits.set(ip, { count: 1, resetTime: now + windowMs });
        return false;
    }
    
    const limitData = ipLimits.get(ip);
    if (now > limitData.resetTime) {
        limitData.count = 1;
        limitData.resetTime = now + windowMs;
        return false;
    }
    
    limitData.count++;
    return limitData.count > maxRequests;
}

const getDbSecret = (env) => (env && env.DB_SECRET) ? env.DB_SECRET : 'MyDeepXAuthSecretKey_2026!#';

async function verifyAppOwnership(c, ownerEmailKey, secret) {
    if(!ownerEmailKey || !secret) return false;
    const record = await dbRequest(c.env, `customers/${ownerEmailKey}`);
    if(!record) return false;
    const dbSecret = getDbSecret(c.env);
    let data = typeof record === 'string' ? decrypt(record, dbSecret) : record;
    if(data && data.metadata) data = decrypt(data.metadata, dbSecret);
    return data && data.secret === secret;
}

async function dispatchEdgeWebhook(c, secret, eventType, eventData) {
    try {
        if (!secret) return;
        const rawSettings = await dbRequest(c.env, `webhookSettings/${secret}`);
        if (!rawSettings) return;
        const dbSecret = getDbSecret(c.env);
        let settings = typeof rawSettings === 'string' ? decrypt(rawSettings, dbSecret) : rawSettings;
        if (typeof settings === 'string') {
            try { settings = JSON.parse(settings); } catch (e) {}
        }
        if (!settings || !settings.url || !settings[eventType]) return;

        const embed = {
            title: eventData.title || '🛡️ DXA Security Alert',
            description: eventData.description || '',
            color: eventData.color || 0xEF4444,
            fields: eventData.fields || [],
            timestamp: new Date().toISOString(),
            footer: { text: 'DeepXAuth Edge Security System' }
        };

        const fetchPromise = fetch(settings.url.trim(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });

        if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
            c.executionCtx.waitUntil(fetchPromise);
        } else {
            await fetchPromise;
        }
    } catch (e) {
        console.error('Edge webhook error:', e);
    }
}

async function dispatchEdgeAuditLog(c, auditData) {
    try {
        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const timestamp = new Date().toISOString();
        const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '127.0.0.1';
        const country = c.req.header('cf-ipcountry') || 'Global';
        const userAgent = c.req.header('user-agent') || 'Edge Worker API';

        const logItem = {
            eventId,
            timestamp,
            type: auditData.type,
            category: auditData.category || 'Security',
            severity: auditData.severity || 'Info',
            actorType: auditData.actorType || 'worker',
            actorEmail: auditData.actorEmail || auditData.username || 'API Client',
            actorSecret: auditData.actorSecret ? `${auditData.actorSecret.substring(0, 8)}...` : undefined,
            application: auditData.application,
            username: auditData.username,
            licenseKey: auditData.licenseKey,
            ip,
            country,
            device: userAgent,
            os: 'Cloudflare Worker Edge',
            hwid: auditData.hwid,
            description: auditData.description,
            metadata: auditData.metadata || {},
            status: auditData.status || 'SUCCESS'
        };

        const fetchPromise = dbRequest(c.env, `system/auditLogs/${eventId}`, 'PUT', logItem);
        if (c.executionCtx && typeof c.executionCtx.waitUntil === 'function') {
            c.executionCtx.waitUntil(fetchPromise);
        } else {
            await fetchPromise;
        }
    } catch (e) {
        console.error('Edge audit log error:', e);
    }
}

let cachedToken = null;
let tokenExpiry = 0;

async function getFirebaseToken(env) {
    if (cachedToken && Date.now() < tokenExpiry) return cachedToken;
    
    const credentialsToTry = [
        { email: env.FIREBASE_AUTH_EMAIL, password: env.FIREBASE_AUTH_PASSWORD },
        { email: 'sdk_worker@deepxauth.com', password: 'WorkerPassword123!#' }
    ];

    for (const cred of credentialsToTry) {
        if (!cred.email || !cred.password) continue;
        try {
            const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${env.FIREBASE_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: cred.email,
                    password: cred.password,
                    returnSecureToken: true
                })
            });
            const text = await resp.text();
            if (resp.ok && text) {
                const data = JSON.parse(text);
                if (data && data.idToken) {
                    cachedToken = data.idToken;
                    tokenExpiry = Date.now() + (parseInt(data.expiresIn || '3600') - 60) * 1000;
                    return cachedToken;
                }
            }
        } catch (e) {
            console.error("Firebase auth token error:", e);
        }
    }
    return cachedToken;
}

async function dbRequest(env, path, method = 'GET', body = null) {
    let token = await getFirebaseToken(env);
    let url = token ? `${env.FIREBASE_DB_URL}/${path}.json?auth=${token}` : `${env.FIREBASE_DB_URL}/${path}.json`;
    const options = { method, headers: { 'Content-Type': 'application/json' } };
    if (body) options.body = JSON.stringify(body);
    
    let resp = await fetch(url, options);

    if (!resp.ok && token) {
        cachedToken = null;
        tokenExpiry = 0;
        token = await getFirebaseToken(env);
        const retryUrl = token ? `${env.FIREBASE_DB_URL}/${path}.json?auth=${token}` : `${env.FIREBASE_DB_URL}/${path}.json`;
        resp = await fetch(retryUrl, options);
    }

    const text = await resp.text();
    if (!resp.ok && method !== 'GET') {
        throw new Error(`Database write failed (${resp.status}): ${text}`);
    }

    if (!text || text.trim() === '' || text.trim() === 'null') return null;

    try {
        return JSON.parse(text);
    } catch (e) {
        return null;
    }
}

const sendResponse = (success, message, extraData = {}) => ({ success, message, ...extraData });

const SDK_MAX_REQUEST_AGE_MS = 2 * 60 * 1000;
const sdkNonceCache = new Map();
const textEncoder = new TextEncoder();
let cachedSigningKey = null;
let cachedSigningPem = null;

const pruneSdkNonceCache = () => {
    const now = Date.now();
    for (const [key, expiresAt] of sdkNonceCache.entries()) {
        if (expiresAt <= now) sdkNonceCache.delete(key);
    }
};

const normalizeSdkString = (value) => typeof value === 'string' ? value : '';

const bytesToHex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase();

const sha256Hex = async (value) => {
    const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(normalizeSdkString(value)));
    return bytesToHex(new Uint8Array(digest));
};

const pemToArrayBuffer = (pem) => {
    const base64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '');

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
};

const arrayBufferToBase64 = (buffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
};

async function getResponseSigningKey(env) {
    const pem = (env.DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM || env.TXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM)?.trim();
    if (!pem) throw new Error('Missing DXA_RESPONSE_SIGNING_PRIVATE_KEY_PEM');

    if (cachedSigningKey && cachedSigningPem === pem) return cachedSigningKey;

    cachedSigningKey = await crypto.subtle.importKey(
        'pkcs8',
        pemToArrayBuffer(pem),
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );
    cachedSigningPem = pem;
    return cachedSigningKey;
}

async function buildSdkSignaturePayload(endpoint, responseBody) {
    const variableLines = Object.keys(responseBody.variables || {})
        .sort()
        .map((key) => `${key}=${normalizeSdkString(responseBody.variables[key])}`)
        .join('\n');

    return [
        `endpoint=${await sha256Hex(endpoint)}`,
        `requestNonce=${await sha256Hex(responseBody.requestNonce)}`,
        `serverTimestamp=${await sha256Hex(responseBody.serverTimestamp)}`,
        `success=${responseBody.success ? '1' : '0'}`,
        `message=${await sha256Hex(responseBody.message)}`,
        `username=${await sha256Hex(responseBody.username)}`,
        `subscription=${await sha256Hex(responseBody.subscription)}`,
        `expiry=${await sha256Hex(responseBody.expiry)}`,
        `serverVersion=${await sha256Hex(responseBody.serverVersion)}`,
        `value=${await sha256Hex(responseBody.value)}`,
        `variables=${await sha256Hex(variableLines ? `${variableLines}\n` : '')}`
    ].join('\n') + '\n';
}

async function signSdkResponse(env, endpoint, responseBody) {
    const privateKey = await getResponseSigningKey(env);
    const payload = await buildSdkSignaturePayload(endpoint, responseBody);
    const signature = await crypto.subtle.sign(
        { name: 'RSASSA-PKCS1-v1_5' },
        privateKey,
        textEncoder.encode(payload)
    );
    return arrayBufferToBase64(signature);
}

function validateSdkRequest(body, endpoint) {
    const clientNonce = normalizeSdkString(body?.clientNonce).trim();
    const clientTimestampRaw = normalizeSdkString(body?.clientTimestamp).trim();

    if (!clientNonce || !clientTimestampRaw) return { ok: false, message: 'MISSING_SECURITY_FIELDS' };
    if (clientNonce.length < 16 || clientNonce.length > 128) return { ok: false, message: 'INVALID_CLIENT_NONCE' };

    const clientTimestamp = Number(clientTimestampRaw);
    if (!Number.isFinite(clientTimestamp)) return { ok: false, message: 'INVALID_CLIENT_TIMESTAMP' };
    if (Math.abs(Date.now() - clientTimestamp * 1000) > SDK_MAX_REQUEST_AGE_MS) return { ok: false, message: 'STALE_REQUEST' };

    pruneSdkNonceCache();
    const replayKey = `${endpoint}:${clientNonce}`;
    if (sdkNonceCache.has(replayKey)) return { ok: false, message: 'REPLAY_BLOCKED' };

    sdkNonceCache.set(replayKey, Date.now() + SDK_MAX_REQUEST_AGE_MS);
    return { ok: true, clientNonce };
}

async function sdkJson(c, endpoint, requestBody, success, message, extraData = {}, status = 200) {
    return c.json(sendResponse(success, message, extraData), 200);
}

async function getAppMetadata(c, secret, appName) {
    const dbSecret = getDbSecret(c.env);
    const metaRaw = await dbRequest(c.env, `applications/${secret}/${appName}/metadata`);
    if (metaRaw) {
        let meta = typeof metaRaw === 'string' ? decrypt(metaRaw, dbSecret) : metaRaw;
        if (typeof meta === 'string') meta = decrypt(metaRaw, 'MyDeepXAuthSecretKey_2026!#');
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e){} }
        return typeof meta === 'object' && meta !== null ? meta : { version: '1.0', applicationPaused: false };
    }
    const appDataRaw = await dbRequest(c.env, `applications/${secret}/${appName}`);
    if (!appDataRaw) return null;
    let appData = appDataRaw;
    if (typeof appData === 'string') appData = decrypt(appData, dbSecret);
    if (typeof appData === 'string') appData = decrypt(appDataRaw, 'MyDeepXAuthSecretKey_2026!#');
    if (typeof appData === 'string') { try { appData = JSON.parse(appData); } catch(e){} }
    if (appData && appData.metadata) {
        let meta = typeof appData.metadata === 'string' ? decrypt(appData.metadata, dbSecret) : appData.metadata;
        if (typeof meta === 'string') { try { meta = JSON.parse(meta); } catch(e){} }
        return typeof meta === 'object' && meta !== null ? meta : { version: '1.0', applicationPaused: false };
    }
    return typeof appData === 'object' && appData !== null ? appData : { version: '1.0', applicationPaused: false };
}

app.post('/login', async (c) => {
    try {
        const ip = c.req.header('CF-Connecting-IP') || 'unknown';
        if (isRateLimited(ip)) return c.json(sendResponse(false, 'TOO_MANY_REQUESTS'), 429);

        const body = await c.req.json();
        let { username, password, secret, appName, appVersion, hwid } = body;
        username = username?.trim(); password = password?.trim(); secret = secret?.trim();
        appName = appName?.trim(); appVersion = appVersion?.trim(); hwid = hwid?.trim();
        if (!username || !password || !secret || !appName || !appVersion) return sdkJson(c, 'login', body, false, 'Missing required fields', {}, 400);

        const dbSecret = getDbSecret(c.env);
        const appData = await getAppMetadata(c, secret, appName);
        if (!appData) return sdkJson(c, 'login', body, false, 'Application not found', {}, 404);
        if (appData.applicationPaused) return sdkJson(c, 'login', body, false, 'APPLICATION_PAUSED', {}, 403);
        
        const serverVer = appData.version || '1.0';
        if (serverVer !== 'UNKNOWN' && serverVer !== appVersion) {
            dispatchEdgeWebhook(c, secret, 'notifyVersionMismatch', {
                title: '⚠️ Version Mismatch / Tampering Alert',
                description: `Outdated or modified client software connected to **${appName}**.`,
                color: 0xF59E0B,
                fields: [
                    { name: 'User', value: username || 'Unknown', inline: true },
                    { name: 'Client Version', value: appVersion, inline: true },
                    { name: 'Server Version', value: serverVer, inline: true },
                    { name: 'IP Address', value: ip, inline: true }
                ]
            });
            dispatchEdgeAuditLog(c, {
                type: 'VERSION_MISMATCH',
                category: 'Security',
                severity: 'Warning',
                status: 'BLOCKED',
                actorType: 'user',
                username,
                application: appName,
                actorSecret: secret,
                description: `Version mismatch for ${username} on ${appName}`
            });
            return sdkJson(c, 'login', body, false, 'VERSION_MISMATCH', { serverVersion: serverVer }, 409);
        }

        const userDataRaw = await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`);
        if (!userDataRaw) {
            dispatchEdgeAuditLog(c, {
                type: 'FAILED_LOGIN',
                category: 'Authentication',
                severity: 'Warning',
                status: 'FAILURE',
                actorType: 'user',
                username,
                application: appName,
                actorSecret: secret,
                description: `Failed login for non-existent user ${username}`
            });
            return sdkJson(c, 'login', body, false, 'Invalid credentials', {}, 401);
        }

        let userData = userDataRaw;
        if (typeof userData === 'string') {
            let dec = decrypt(userData, dbSecret);
            if (typeof dec === 'string') dec = decrypt(userData, 'MyDeepXAuthSecretKey_2026!#');
            if (typeof dec === 'string') { try { dec = JSON.parse(dec); } catch (e) {} }
            userData = dec;
        }

        if (typeof userData !== 'object' || userData === null) {
            return sdkJson(c, 'login', body, false, 'Invalid credentials', {}, 401);
        }

        if (userData.password !== password) {
            dispatchEdgeWebhook(c, secret, 'notifyFailedLogin', {
                title: '🔑 Failed Password Attempt',
                description: `Invalid password entered for user **${username}** on app **${appName}**.`,
                color: 0xF59E0B,
                fields: [
                    { name: 'User', value: username, inline: true },
                    { name: 'IP Address', value: ip, inline: true }
                ]
            });
            dispatchEdgeAuditLog(c, {
                type: 'FAILED_LOGIN',
                category: 'Authentication',
                severity: 'Warning',
                status: 'FAILURE',
                actorType: 'user',
                username,
                application: appName,
                actorSecret: secret,
                description: `Invalid password attempt for user ${username}`
            });
            return sdkJson(c, 'login', body, false, 'Invalid credentials', {}, 401);
        }

        if (userData.isBanned) {
            dispatchEdgeWebhook(c, secret, 'notifyUserBanned', {
                title: '⛔ Banned User Access Attempt',
                description: `Banned user account **${username}** attempted to authenticate on app **${appName}**.`,
                color: 0xEF4444,
                fields: [
                    { name: 'User', value: username, inline: true },
                    { name: 'HWID', value: hwid || 'N/A', inline: true },
                    { name: 'IP Address', value: ip, inline: true }
                ]
            });
            dispatchEdgeAuditLog(c, {
                type: 'USER_BANNED',
                category: 'Security',
                severity: 'Critical',
                status: 'BLOCKED',
                actorType: 'user',
                username,
                application: appName,
                actorSecret: secret,
                hwid,
                description: `Banned user ${username} attempted authentication`
            });
            return sdkJson(c, 'login', body, false, 'USER_BANNED', {}, 403);
        }

        if (userData.hwidLock !== false) {
            const currentSid = userData.sid || "";
            if (!currentSid || currentSid === "" || currentSid === "HWID_FAIL") {
                if (hwid && hwid !== "" && hwid !== "HWID_FAIL") {
                    userData.sid = hwid;
                    await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`, 'PUT', encrypt(userData, dbSecret));
                    dispatchEdgeAuditLog(c, {
                        type: 'HWID_BOUND',
                        category: 'User',
                        severity: 'Success',
                        status: 'SUCCESS',
                        actorType: 'user',
                        username,
                        application: appName,
                        actorSecret: secret,
                        hwid,
                        description: `Bound HWID fingerprint for user ${username}`
                    });
                }
            } else if (hwid && hwid !== "" && hwid !== "HWID_FAIL" && currentSid !== hwid) {
                dispatchEdgeWebhook(c, secret, 'notifyHwidMismatch', {
                    title: '🚨 HWID Mismatch Security Threat',
                    description: `Unauthorized computer/HWID login attempt detected on locked account **${username}** for app **${appName}**.`,
                    color: 0xEF4444,
                    fields: [
                        { name: 'Target Account', value: username, inline: true },
                        { name: 'Registered HWID', value: userData.sid || 'Locked', inline: false },
                        { name: 'Attempted HWID', value: hwid || 'Unknown', inline: false },
                        { name: 'IP Address', value: ip, inline: true }
                    ]
                });
                dispatchEdgeAuditLog(c, {
                    type: 'HWID_MISMATCH',
                    category: 'Security',
                    severity: 'Critical',
                    status: 'BLOCKED',
                    actorType: 'user',
                    username,
                    application: appName,
                    actorSecret: secret,
                    hwid,
                    description: `HWID mismatch threat blocked on user ${username}`
                });
                return sdkJson(c, 'login', body, false, 'HWID_MISMATCH', {}, 403);
            }
        }

        if (userData.expiry && userData.expiry !== 'lifetime') {
            if (new Date(userData.expiry) < new Date()) return sdkJson(c, 'login', body, false, 'LICENSE_EXPIRED', {}, 403);
        }

        if (userData.oneTime === true) await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`, 'DELETE');

        dispatchEdgeWebhook(c, secret, 'notifyLogin', {
            title: '✅ User Authenticated',
            description: `User **${username}** logged into app **${appName}** successfully.`,
            color: 0x10B981,
            fields: [
                { name: 'User', value: username, inline: true },
                { name: 'Subscription', value: userData.subscription || 'default', inline: true },
                { name: 'Expiry', value: userData.expiry || 'lifetime', inline: true }
            ]
        });

        dispatchEdgeAuditLog(c, {
            type: 'USER_LOGIN',
            category: 'Authentication',
            severity: 'Success',
            status: 'SUCCESS',
            actorType: 'user',
            username,
            application: appName,
            actorSecret: secret,
            hwid,
            description: `User ${username} logged in successfully to ${appName}`
        });

        return sdkJson(c, 'login', body, true, 'LOGIN_SUCCESS', {
            username: username, subscription: userData.subscription || 'default', expiry: userData.expiry || 'lifetime'
        });
    } catch (error) { return c.json(sendResponse(false, 'Internal Server Error: ' + error.message), 500); }
});

app.post('/register', async (c) => {
    try {
        const ip = c.req.header('CF-Connecting-IP') || 'unknown';
        if (isRateLimited(ip)) return c.json(sendResponse(false, 'TOO_MANY_REQUESTS'), 429);

        const body = await c.req.json();
        let { username, password, licenseKey, secret, appName, appVersion, hwid } = body;
        username = username?.trim();
        password = password?.trim();
        licenseKey = licenseKey?.trim();
        secret = secret?.trim();
        appName = appName?.trim();
        appVersion = appVersion?.trim();
        hwid = hwid?.trim();

        if (!username || !password || !licenseKey || !secret || !appName || !appVersion) {
            return sdkJson(c, 'register', body, false, 'Missing required fields', {}, 400);
        }

        const dbSecret = getDbSecret(c.env);
        const appData = await getAppMetadata(c, secret, appName);
        if (!appData) return sdkJson(c, 'register', body, false, 'App not found', {}, 404);
        if (appData.applicationPaused) return sdkJson(c, 'register', body, false, 'APPLICATION_PAUSED', {}, 403);

        const serverVer = appData.version || '1.0';
        if (serverVer !== 'UNKNOWN' && serverVer !== appVersion) {
            return sdkJson(c, 'register', body, false, 'VERSION_MISMATCH', { serverVersion: serverVer }, 409);
        }

        const userSnapshot = await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`);
        if (userSnapshot && userSnapshot !== null && !userSnapshot.error && userSnapshot !== "null") {
            return sdkJson(c, 'register', body, false, 'Username taken', {}, 409);
        }

        const licenseDataRaw = await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${licenseKey}`);
        if (!licenseDataRaw) return sdkJson(c, 'register', body, false, 'Invalid or used License', {}, 404);

        let licenseData = licenseDataRaw;
        if (typeof licenseData === 'string') {
            let dec = decrypt(licenseData, dbSecret);
            if (typeof dec === 'string') dec = decrypt(licenseData, 'MyDeepXAuthSecretKey_2026!#');
            if (typeof dec === 'string') { try { dec = JSON.parse(dec); } catch (e) {} }
            licenseData = dec;
        }

        if (typeof licenseData !== 'object' || licenseData === null) {
            return sdkJson(c, 'register', body, false, 'Invalid or used License', {}, 404);
        }

        if (licenseData.used) {
            return sdkJson(c, 'register', body, false, 'Invalid or used License', {}, 409);
        }

        const newUser = {
            username: username,
            password,
            hwidLock: true,
            sid: (hwid && hwid !== "" && hwid !== "HWID_FAIL") ? hwid : "",
            isBanned: false,
            license: licenseKey,
            expiry: licenseData.expiry || 'lifetime',
            subscription: licenseData.rank || licenseData.subscription || 'default',
            created: new Date().toISOString()
        };

        await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`, 'PUT', encrypt(newUser, dbSecret));

        licenseData.used = true;
        licenseData.associatedUser = username;
        await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${licenseKey}`, 'PUT', encrypt(licenseData, dbSecret));

        return sdkJson(c, 'register', body, true, 'REGISTER_SUCCESS');
    } catch (error) {
        return c.json(sendResponse(false, 'Server error: ' + error.message), 500);
    }
});

app.post('/isapplicationpaused', async (c) => {
    try {
        const body = await c.req.json();
        let { secret, appName } = body;
        secret = secret?.trim();
        appName = appName?.trim();

        if (!secret || !appName) return sdkJson(c, 'isapplicationpaused', body, false, 'Missing required fields', {}, 400);

        const appData = await getAppMetadata(c, secret, appName);
        if (!appData) return sdkJson(c, 'isapplicationpaused', body, false, 'App not found', {}, 404);

        return sdkJson(c, 'isapplicationpaused', body, !!appData.applicationPaused, appData.applicationPaused ? 'APPLICATION_PAUSED' : 'APPLICATION_ACTIVE');
    } catch (error) {
        return c.json(sendResponse(false, 'Server error'), 500);
    }
});

app.post('/create_user', async (c) => {
    try {
        const body = await c.req.json();
        let { ownerEmailKey, username, password, secret, appName, appVersion, hwid, expiry, subscription, hwidLock, oneTime } = body;
        if (!username || !password || !secret || !appName || !appVersion) return c.json(sendResponse(false, 'Missing required fields'));
        
        if (ownerEmailKey) {
            const isOwner = await verifyAppOwnership(c, ownerEmailKey, secret);
            if (!isOwner) return c.json(sendResponse(false, 'Unauthorized'));
        }

        const appData = await getAppMetadata(c, secret, appName);
        if (!appData) return c.json(sendResponse(false, 'App not found'));
        if (appData.applicationPaused) return c.json(sendResponse(false, 'APPLICATION_PAUSED'));
        if ((appData.version || 'UNKNOWN') !== appVersion) return c.json(sendResponse(false, 'VERSION_MISMATCH'));

        const userSnapshot = await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`);
        if (userSnapshot) return c.json(sendResponse(false, 'Username taken'));

        const dbSecret = c.env.DB_SECRET || 'MyDeepXAuthSecretKey_2026!#';

        const newUser = {
            password,
            hwidLock: hwidLock !== undefined ? hwidLock : true,
            sid: hwid || "",
            isBanned: false,
            license: 'direct',
            expiry: expiry || 'lifetime',
            subscription: subscription || 'default',
            oneTime: oneTime || false,
            created: new Date().toISOString()
        };
        await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`, 'PUT', encrypt(newUser, dbSecret));
        return c.json(sendResponse(true, 'USER_CREATED'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.post('/versioncheck', async (c) => {
    try {
        const body = await c.req.json();
        const { secret, appName, appVersion } = body;
        const appData = await getAppMetadata(c, secret, appName);
        if (!appData) return sdkJson(c, 'versioncheck', body, false, 'App not found', {}, 404);

        const currentVersion = appData.version || '1.0';
        if (!appVersion || currentVersion === appVersion || currentVersion === '1.0' || !appData.version) {
            return sdkJson(c, 'versioncheck', body, true, 'VERSION_OK', { serverVersion: currentVersion });
        }
        return sdkJson(c, 'versioncheck', body, false, 'VERSION_MISMATCH', { serverVersion: currentVersion }, 409);
    } catch (e) {
        return sdkJson(c, 'versioncheck', {}, false, 'Server error: ' + e.message, {}, 500);
    }
});

app.post('/getvariable', async (c) => {
    try {
        const body = await c.req.json();
        let { secret, appName, appVersion, varName } = body;
        const dbSecret = getDbSecret(c.env);
        const appData = await getAppMetadata(c, secret, appName);
        if (!appData) return sdkJson(c, 'getvariable', body, false, 'App not found', {}, 404);
        if (appData.applicationPaused) return sdkJson(c, 'getvariable', body, false, 'APPLICATION_PAUSED', {}, 403);
        if ((appData.version || 'UNKNOWN') !== appVersion) return sdkJson(c, 'getvariable', body, false, 'VERSION_MISMATCH', { serverVersion: appData.version || 'UNKNOWN' }, 409);
        const varValueRaw = await dbRequest(c.env, `applications/${secret}/${appName}/variables/${varName}`);
        if (varValueRaw) return sdkJson(c, 'getvariable', body, true, 'VARIABLE_FOUND', { value: decrypt(varValueRaw, dbSecret) });
        return sdkJson(c, 'getvariable', body, false, 'VARIABLE_NOT_FOUND', {}, 404);
    } catch (e) { return c.json(sendResponse(false, 'Server Error'), 500); }
});

app.post('/getvariables', async (c) => {
    try {
        const body = await c.req.json();
        let { secret, appName } = body;
        const dbSecret = getDbSecret(c.env);
        const rawVars = await dbRequest(c.env, `applications/${secret}/${appName}/variables`);
        let vars = {};
        if (rawVars) for (const key in rawVars) vars[key] = decrypt(rawVars[key], dbSecret);
        return sdkJson(c, 'getvariables', body, true, rawVars ? 'VARIABLES_FOUND' : 'NO_VARIABLES', { variables: vars });
    } catch (e) { return c.json(sendResponse(false, 'Error'), 500); }
});

app.post('/create_app', async (c) => {
    try {
        const { ownerEmailKey, secret, appName } = await c.req.json();
        if (!secret || !appName) return c.json(sendResponse(false, 'Missing required fields'));
        if (ownerEmailKey) {
            const isOwner = await verifyAppOwnership(c, ownerEmailKey, secret);
            if (!isOwner) return c.json(sendResponse(false, 'Unauthorized'));
        }
        const dbSecret = getDbSecret(c.env);
        const metaRaw = await dbRequest(c.env, `applications/${secret}/${appName}/metadata`);
        if (metaRaw) return c.json(sendResponse(false, 'App already exists'));
        const meta = { created: new Date().toISOString(), version: "1.0", applicationPaused: false };
        await dbRequest(c.env, `applications/${secret}/${appName}/metadata`, 'PUT', encrypt(meta, dbSecret));
        return c.json(sendResponse(true, 'APP_CREATED'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.post('/delete_app', async (c) => {
    try {
        const { ownerEmailKey, secret, appName } = await c.req.json();
        if (!secret || !appName) return c.json(sendResponse(false, 'Missing required fields'));
        if (ownerEmailKey) {
            const isOwner = await verifyAppOwnership(c, ownerEmailKey, secret);
            if (!isOwner) return c.json(sendResponse(false, 'Unauthorized'));
        }
        await dbRequest(c.env, `applications/${secret}/${appName}`, 'DELETE');
        return c.json(sendResponse(true, 'APP_DELETED'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.post('/delete_user', async (c) => {
    try {
        const { ownerEmailKey, secret, appName, username } = await c.req.json();
        if (!secret || !appName || !username) return c.json(sendResponse(false, 'Missing required fields'));
        if (ownerEmailKey) {
            const isOwner = await verifyAppOwnership(c, ownerEmailKey, secret);
            if (!isOwner) return c.json(sendResponse(false, 'Unauthorized'));
        }

        const dbSecret = getDbSecret(c.env);
        const userSnapshot = await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`);
        if (userSnapshot) {
            let user = userSnapshot;
            if (typeof user === 'string') user = decrypt(user, dbSecret);
            if (user && user.license && user.license !== 'direct') {
                await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${user.license}`, 'DELETE');
            }
        }
        await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`, 'DELETE');
        return c.json(sendResponse(true, 'USER_DELETED'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.post('/reset_hwid', async (c) => {
    try {
        const { secret, appName, username } = await c.req.json();
        if (!secret || !appName || !username) return c.json(sendResponse(false, 'Missing required fields'));

        const dbSecret = getDbSecret(c.env);
        const userSnapshot = await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`);
        if (!userSnapshot) return c.json(sendResponse(false, 'User not found'));

        let user = userSnapshot;
        if (typeof user === 'string') user = decrypt(user, dbSecret);
        user.sid = "";

        await dbRequest(c.env, `applications/${secret}/${appName}/users/${username}`, 'PUT', encrypt(user, dbSecret));
        return c.json(sendResponse(true, 'HWID_RESET'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.post('/create_license', async (c) => {
    try {
        const { ownerEmailKey, secret, appName, licenseKey, rank, expiry, note } = await c.req.json();
        if (!secret || !appName || !licenseKey) return c.json(sendResponse(false, 'Missing required fields'));
        if (ownerEmailKey) {
            const isOwner = await verifyAppOwnership(c, ownerEmailKey, secret);
            if (!isOwner) return c.json(sendResponse(false, 'Unauthorized'));
        }

        const dbSecret = getDbSecret(c.env);
        const licenseDataRaw = await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${licenseKey}`);
        if (licenseDataRaw) return c.json(sendResponse(false, 'License already exists'));

        const licenseData = {
            used: false,
            rank: rank || 'default',
            expiry: expiry || 'lifetime',
            createdBy: 'api',
            note: note || '',
            created: new Date().toISOString()
        };

        await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${licenseKey}`, 'PUT', encrypt(licenseData, dbSecret));
        return c.json(sendResponse(true, 'LICENSE_CREATED'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.post('/delete_license', async (c) => {
    try {
        const { ownerEmailKey, secret, appName, licenseKey } = await c.req.json();
        if (!secret || !appName || !licenseKey) return c.json(sendResponse(false, 'Missing required fields'));
        if (ownerEmailKey) {
            const isOwner = await verifyAppOwnership(c, ownerEmailKey, secret);
            if (!isOwner) return c.json(sendResponse(false, 'Unauthorized'));
        }

        const dbSecret = getDbSecret(c.env);
        const licenseDataRaw = await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${licenseKey}`);
        if (licenseDataRaw) {
            let license = licenseDataRaw;
            if (typeof license === 'string') license = decrypt(license, dbSecret);
            if (license && license.associatedUser) {
                await dbRequest(c.env, `applications/${secret}/${appName}/users/${license.associatedUser}`, 'DELETE');
            }
        }
        await dbRequest(c.env, `applications/${secret}/${appName}/licenses/${licenseKey}`, 'DELETE');
        return c.json(sendResponse(true, 'LICENSE_DELETED'));
    } catch (error) { return c.json(sendResponse(false, 'Server error'), 500); }
});

app.notFound(async (c) => {
    if (c.env && c.env.ASSETS) {
        return c.env.ASSETS.fetch(c.req.raw);
    }
    return c.text('Not Found', 404);
});

export const onRequest = handle(app);
