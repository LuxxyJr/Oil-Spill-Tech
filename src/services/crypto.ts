/**
 * End-to-End Cryptography and Evidentiary Tamper-Proof Seal Service
 * Uses Web Crypto API (SubtleCrypto) for zero-dependency client-side security
 */

export async function computeSHA256(data: string | object): Promise<string> {
  const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(jsonString);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface EncryptedPayload {
  cipherTextHex: string;
  ivHex: string;
  timestamp: string;
  keyFingerprint: string;
}

export async function encryptSensitiveDossier(
  content: string,
  passphrase = 'MARPOL-ANNEX-I-EVIDENTIARY-2024'
): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  
  // Derive 256-bit AES-GCM key from passphrase
  const pwBuffer = encoder.encode(passphrase);
  const pwHash = await window.crypto.subtle.digest('SHA-256', pwBuffer);
  
  const key = await window.crypto.subtle.importKey(
    'raw',
    pwHash,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const dataBuffer = encoder.encode(content);

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  const cipherTextHex = Array.from(new Uint8Array(encryptedBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const ivHex = Array.from(iv)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  const keyFingerprint = (await computeSHA256(passphrase)).slice(0, 16);

  return {
    cipherTextHex,
    ivHex,
    timestamp: new Date().toISOString(),
    keyFingerprint: `KEY-ID-${keyFingerprint.toUpperCase()}`
  };
}

export async function decryptSensitiveDossier(
  encrypted: EncryptedPayload,
  passphrase = 'MARPOL-ANNEX-I-EVIDENTIARY-2024'
): Promise<string> {
  const encoder = new TextEncoder();
  const pwBuffer = encoder.encode(passphrase);
  const pwHash = await window.crypto.subtle.digest('SHA-256', pwBuffer);

  const key = await window.crypto.subtle.importKey(
    'raw',
    pwHash,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const ivBytes = new Uint8Array(
    encrypted.ivHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );
  const cipherBytes = new Uint8Array(
    encrypted.cipherTextHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
  );

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    key,
    cipherBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}
