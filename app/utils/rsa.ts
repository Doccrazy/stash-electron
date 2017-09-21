import * as sshpk from 'sshpk';
import { utils } from 'ssh2-streams';

function isPutty(key: string | Buffer) {
  const str = key instanceof Buffer ? key.toString('utf8') : key;
  return str.startsWith('PuTTY-User-Key-File-2');
}

export function parsePrivateKey(key: string | Buffer, passphrase?: string) {
  if (isPutty(key)) {
    const parsed = utils.parseKey(key);
    if (parsed instanceof Error) {
      throw parsed;
    }
    if (parsed.encryption) {
      if (passphrase) {
        try {
          utils.decryptKey(parsed, passphrase);
        } catch {
          throw new sshpk.KeyParseError('(unnamed)', 'PPK', new Error('Incorrect passphrase'));
        }
      } else {
        throw new sshpk.KeyEncryptedError('(unnamed)', 'PPK');
      }
    }
    return sshpk.parsePrivateKey(parsed.privateOrig, 'pem');
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
