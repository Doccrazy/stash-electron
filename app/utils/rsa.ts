import * as crypto from 'crypto';
import * as sshpk from 'sshpk';
import { ParsedKey, utils } from 'ssh2-streams';

function isPutty(key: string | Buffer) {
  const str = key instanceof Buffer ? key.toString('utf8') : key;
  return str.startsWith('PuTTY-User-Key-File-2');
}

export function parsePrivateKey(key: string | Buffer, passphrase?: string) {
  if (isPutty(key)) {
    const parsed = utils.parseKey(key, passphrase) as ParsedKey;
    if (parsed instanceof Error) {
      if (parsed.message.includes('no passphrase')) {
        throw new sshpk.KeyEncryptedError('(unnamed)', 'PPK');
      } else if (parsed.message.includes('bad passphrase')) {
        throw new sshpk.KeyParseError('(unnamed)', 'PPK', new Error('Incorrect passphrase'));
      }
      throw parsed;
    }
    return sshpk.parsePrivateKey(parsed.getPrivatePEM(), 'pem');
  }
  return sshpk.parsePrivateKey(key, 'auto', {passphrase});
}

export function parseKey(key: string | Buffer, passphrase?: string) {
  try {
    return parsePrivateKey(key, passphrase);
  } catch (e) {
    if (e instanceof sshpk.KeyParseError && (e as any).innerErr && (e as any).innerErr.message === 'key is not a private key') {
      return sshpk.parseKey(key, 'auto', {passphrase});
    }
    throw e;
  }
}

export function parsePublicKey(key: string | Buffer, passphrase?: string): sshpk.Key {
  const result = parseKey(key, passphrase);
  if (result instanceof sshpk.PrivateKey) {
    return result.toPublic();
  }
  return result;
}

/**
 * Generate an RSA private key using the WebCrypto API
 * @returns {Promise<Buffer>} generated key in PKCS8 format
 */
export async function generateRSAKeyPKCS8(modulusLength: number) {
  console.time('generateRSAKeyPKCS8');

  const key = await window.crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength,
    publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    hash: {name: 'SHA-256'}
  }, true, ['sign', 'verify']);

  const keyData = Buffer.from(await window.crypto.subtle.exportKey('pkcs8', key.privateKey));

  console.timeEnd('generateRSAKeyPKCS8');
  return keyData;
}

/**
 * Converts a PKCS8 binary private key to PEM format, optionally encrypting with AES
 */
export function toPEM(pkcs8Buf: Buffer, passphrase?: string): string {
  // remove PKCS8 header (always 26 bytes), leaving only PKCS1 structure
  const pkcs1Buf = pkcs8Buf.slice(26);

  if (passphrase) {
    // generate random IV
    const iv = crypto.randomBytes(16);
    // generate AES encryption key, using IV as salt
    const key = deriveKey(passphrase, iv);

    // encrypt using AES-128
    const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    const encrypted = Buffer.concat([cipher.update(pkcs1Buf), cipher.final()]);

    // wrap with PEM header/footer
    return toPEMString(encrypted, iv);
  } else {
    return toPEMString(pkcs1Buf);
  }
}

function toPEMString(keyData: Buffer, aesEncryptionIV?: Buffer) {
  let header = '';
  if (aesEncryptionIV) {
    header = `
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,${aesEncryptionIV.toString('hex').toUpperCase()}
`;
  }
  return `-----BEGIN RSA PRIVATE KEY-----${header}
${keyData.toString('base64').match(/.{1,64}/g)!.join('\n')}
-----END RSA PRIVATE KEY-----
`;
}

// single-iteration OpenSSL key derivation with 16 bytes output boils down to a simple MD5 hash
function deriveKey(password: string, iv: Buffer) {
  return crypto.createHash('md5')
    .update(Buffer.from(password, 'utf8'))
    .update(iv.slice(0, 8))  // PKCS5 salt length
    .digest();
}

/**
 * Even though a private key loads and decrypts correctly, it may still be rejected by OpenSSL.
 * @throws Error if the key fails to load into OpenSSL
 */
export function testPrivateKey(key: sshpk.PrivateKey) {
  crypto.createPrivateKey(key.toBuffer('pem', null).toString());
}
