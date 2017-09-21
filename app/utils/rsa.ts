import * as sshpk from 'sshpk';

export function parsePrivateKey(key: string | Buffer, passphrase?: string) {
  return sshpk.parsePrivateKey(key, 'auto', {passphrase});
}

export function parseKey(key: string | Buffer, passphrase?: string) {
  try {
    return parsePrivateKey(key, passphrase);
  } catch {
    return sshpk.parseKey(key, 'auto', {passphrase});
  }
}

export function parsePublicKey(key: string | Buffer, passphrase?: string): sshpk.Key {
  const result = parseKey(key, passphrase);
  if (result instanceof sshpk.PrivateKey) {
    return result.toPublic();
  }
  return result;
}
