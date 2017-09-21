import * as sshpk from 'sshpk';

export default interface KeyProvider {
  getKey(username: string): sshpk.Key | null
  listUsers(): string[]
  findUser(key: sshpk.Key | sshpk.PrivateKey): string | null

  addKey(username: string, key: sshpk.Key): void
  deleteKey(username: string): void;

  save(): Promise<void>
}

function isKeyProvider(obj: any): obj is KeyProvider {
  return !!obj.listUsers && !!obj.addKey;
}

export function findUser(provider: KeyProvider | { [username: string]: sshpk.Key }, key: sshpk.Key | sshpk.PrivateKey): string | null {
  if (key instanceof sshpk.PrivateKey) {
    key = key.toPublic();
  }
  if (!(key instanceof sshpk.Key)) {
    throw new Error('not a valid public key');
  }
  for (const username of (isKeyProvider(provider) ? provider.listUsers() : Object.keys(provider))) {
    const storedKey = isKeyProvider(provider) ? provider.getKey(username) as sshpk.Key : provider[username];
    // TODO might use the fingerprint function for comparison, but this would compute a SHA256 hash
    if ((storedKey.part as any).e.data.equals((key.part as any).e.data) && (storedKey.part as any).n.data.equals((key.part as any).n.data)) {
      return username;
    }
  }
  return null;
}
