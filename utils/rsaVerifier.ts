import { SignatureVerificationResult } from '../types/sandbox';

export const NOTEXE_PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAhnfjJEqt8/GbGNkhn9wu
8/7cStTdgEv2712vsJUhyJXS/hhG6wLcTHCk/hY/+jICvAF7lsSAMmz4Nwntp62B
cPj+OP6eWcX4WSSciK0O+i1qiF0QRXEFchnQCcUa3GVxrDLKFPB5/44ctuINqUV5
dZZYhZl39zQcs+2zvY3kJGvOafopGhsuedMh7eLkPP09lUAXnX30yOyU4G71MXut
mKo1V8M3F4O7G91s6bZLhxONOU6NhgSuykCM2u3hzP34nXC4uJe0Lx/8ENftWNwZ
3Qf3cuXcXCZJsWSzEhfYSZX5waQOUoE5qqqslygoCt40lCP7qk1Z9drP9C9losxy
f1vHTQIDAQAB
-----END PUBLIC KEY-----`;

export const DXA_PUBLIC_KEY_PEM = NOTEXE_PUBLIC_KEY_PEM;

const encoder = new TextEncoder();

const normalizeString = (val: any): string => (typeof val === 'string' ? val : '');

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('').toUpperCase();

async function sha256Hex(val: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(normalizeString(val)));
  return bytesToHex(new Uint8Array(digest));
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/g, '')
    .replace(/-----END PUBLIC KEY-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64.replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export async function buildSignaturePayload(endpoint: string, body: any): Promise<string> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  const variableLines = Object.keys(body?.variables || {})
    .sort()
    .map(key => `${key}=${normalizeString(body.variables[key])}`)
    .join('\n');

  const payload = [
    `endpoint=${await sha256Hex(cleanEndpoint)}`,
    `requestNonce=${await sha256Hex(body?.requestNonce)}`,
    `serverTimestamp=${await sha256Hex(body?.serverTimestamp)}`,
    `success=${body?.success ? '1' : '0'}`,
    `message=${await sha256Hex(body?.message)}`,
    `username=${await sha256Hex(body?.username)}`,
    `subscription=${await sha256Hex(body?.subscription)}`,
    `expiry=${await sha256Hex(body?.expiry)}`,
    `serverVersion=${await sha256Hex(body?.serverVersion)}`,
    `value=${await sha256Hex(body?.value)}`,
    `variables=${await sha256Hex(variableLines ? `${variableLines}\n` : '')}`
  ].join('\n') + '\n';

  return payload;
}

export async function verifyRsaSignature(
  endpoint: string,
  responseBody: any
): Promise<SignatureVerificationResult> {
  const startTime = performance.now();
  const signature = responseBody?.signature;

  if (!signature || typeof signature !== 'string') {
    return {
      hasSignature: false,
      verified: false,
      durationMs: 0
    };
  }

  try {
    const payloadStr = await buildSignaturePayload(endpoint, responseBody);
    const payloadBytes = encoder.encode(payloadStr);
    const signatureBytes = base64ToUint8Array(signature);

    const publicKey = await crypto.subtle.importKey(
      'spki',
      pemToArrayBuffer(NOTEXE_PUBLIC_KEY_PEM),
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBytes,
      payloadBytes
    );

    const endTime = performance.now();
    const durationMs = Math.max(1, Math.round(endTime - startTime));

    return {
      hasSignature: true,
      verified: isValid,
      durationMs,
      rawSignature: signature
    };
  } catch (err: any) {
    const endTime = performance.now();
    return {
      hasSignature: true,
      verified: false,
      durationMs: Math.max(1, Math.round(endTime - startTime)),
      rawSignature: signature,
      error: err?.message || 'RSA Signature verification error'
    };
  }
}
