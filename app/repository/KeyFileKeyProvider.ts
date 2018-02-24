import * as path from 'path';
import * as sshpk from 'sshpk';
import FileSystem from './fs/FileSystem';
import NodeFileSystem from './fs/NodeFileSystem';
import KeyProvider, {findUser} from './KeyProvider';

export const FILENAME = '.keys.json';

export default class KeyFileKeyProvider implements KeyProvider {
  private keyfile: string;
  private keys: { [username: string]: sshpk.Key };

  private constructor(keyfile: string, keys: KeyFileKeyProvider['keys'], private readonly fs: FileSystem = new NodeFileSystem()) {
    this.keyfile = keyfile;
    this.keys = keys;
  }

  static async create(repoPath: string, fs: FileSystem = new NodeFileSystem()) {
    const keyfile = path.join(repoPath, FILENAME);
    const keys: KeyFileKeyProvider['keys'] = {};

    if (await fs.exists(keyfile)) {
      const parsedKeyfile = JSON.parse((await fs.readFile(keyfile)).toString());
      for (const username of Object.keys(parsedKeyfile)) {
        keys[username] = sshpk.parseKey(parsedKeyfile[username], 'auto');
      }
    }
    return new KeyFileKeyProvider(keyfile, keys, fs);
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
    return this.fs.writeFile(this.keyfile, Buffer.from(JSON.stringify(serKeyfile, null, '  ')));
  }
}
