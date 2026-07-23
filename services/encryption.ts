
import { DB_SECRET } from '../constants';

declare const CryptoJS: any;

export function encrypt(data: any): string {
  if (!data) return '';
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.AES.encrypt(str, DB_SECRET).toString();
}

export function decrypt(ciphertext: any, customSecret?: string): any {
  if (!ciphertext) return ciphertext;
  if (typeof ciphertext === 'object') return ciphertext;
  
  if (typeof ciphertext === 'string') {
    const trimmed = ciphertext.trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try { return JSON.parse(trimmed); } catch (e) {}
    }
  }

  const secretsToTry = [
    customSecret,
    DB_SECRET,
    'MyDeepXAuthSecretKey_2026!#'
  ].filter(Boolean);

  for (const sec of secretsToTry) {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, sec);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (decrypted) {
        try {
          return JSON.parse(decrypted);
        } catch (e) {
          return decrypted;
        }
      }
    } catch (e) {}
  }

  return ciphertext;
}
