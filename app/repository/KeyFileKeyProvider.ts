import * as fs from 'fs-extra';
import * as path from 'path';
import * as sshpk from 'sshpk';
import KeyProvider, {findUser} from './KeyProvider';

const FILENAME = '.keys.json';

export default class KeyFileKeyProvider implements KeyProvider {
  private keyfile: string;
  private keys: { [username: string]: sshpk.Key };

  constructor(repoPath: string) {
    this.keyfile = path.join(repoPath, FILENAME);
    this.keys = {};

    if (fs.existsSync(this.keyfile)) {
      const parsedKeyfile = JSON.parse(fs.readFileSync(this.keyfile, 'utf8'));
      for (const username of Object.keys(parsedKeyfile)) {
        this.keys[username] = sshpk.parseKey(parsedKeyfile[username], 'auto');
      }
    }
  }

  getKey(username: string) {
    return this.keys[username];
  }

  listUsers() {
    return Object.keys(this.keys);
  }

  findUser(key: sshpk.Key | sshpk.PrivateKey): string | null {
    return findUser(this, key);
  }

  addKey(username: string, key: sshpk.Key) {
    if (!(key instanceof sshpk.Key)) {
      throw new Error('not a valid public key');
    }
    this.keys[username] = key;
  }

  deleteKey(username: string): void {
    delete this.keys[username];
  }

  save() {
    const serKeyfile: { [username: string]: string } = {};
    for (const username of this.listUsers()) {
      serKeyfile[username] = this.getKey(username).toString('ssh');
    }
    return fs.writeFile(this.keyfile, JSON.stringify(serKeyfile, null, '  '));
  }
}
