import * as path from 'path';
import * as crypto from 'crypto';
import * as sshpk from 'sshpk';
import {ALG_KEY_BYTES} from '../utils/cryptoStream';
import FileSystem from './fs/FileSystem';
import NodeFileSystem from './fs/NodeFileSystem';
import KeyProvider from './KeyProvider';

export const FILENAME = '.users.json';

function hashMasterKey(masterKey: Buffer): Buffer {
  const hash = crypto.createHash('sha256');
  hash.update(masterKey);
  return hash.digest();
}

function encryptMasterKey(masterKey: Buffer, publicKey: sshpk.Key | sshpk.PrivateKey): Buffer {
  if (publicKey instanceof sshpk.PrivateKey) {
    publicKey = publicKey.toPublic();
  }
  if (!publicKey.comment || publicKey.comment === '(unnamed)') {
    console.warn('No key name has been set! This means you will not be able to identify who it belongs to later.');
  }
  const pemPubKey = publicKey.toString('pem');

  return crypto.publicEncrypt(pemPubKey, masterKey);
}

function decryptMasterKey(hashedMasterKey: Buffer, encMasterKey: Buffer, privateKey: sshpk.PrivateKey): Buffer | null {
  const pemPrivKey = (privateKey as any).toString('pem');

  const masterKey = crypto.privateDecrypt(pemPrivKey, encMasterKey);

  const verifyHash = hashMasterKey(masterKey);
  if (verifyHash.equals(hashedMasterKey)) {
    return masterKey;
  }
  return null;
}

interface FileFormat {
  hashedMasterKey: string,
  encryptedKeys: {[username: string]: string}
}

export default class UsersFile {
  private readonly usersFile: string;
  private encryptedKeys: {[username: string]: Buffer} = {};
  private hashedMasterKey: Buffer;
  private masterKey: Buffer | null;

  private constructor(buf: Buffer | null | undefined, filename: string | null | undefined, private readonly fs: FileSystem = new NodeFileSystem()) {
    if (filename) {
      this.usersFile = filename;
    }

    if (buf) {
      const parsedFile: FileFormat = JSON.parse(buf.toString('utf8'));
      this.hashedMasterKey = Buffer.from(parsedFile.hashedMasterKey, 'base64');
      if (!this.hashedMasterKey) {
        throw new Error(`Failed to parse ${FILENAME}: missing masterkey hash`);
      }
      for (const username of Object.keys(parsedFile.encryptedKeys)) {
        this.encryptedKeys[username] = Buffer.from(parsedFile.encryptedKeys[username], 'base64');
      }
    }
  }

  static async forDirectory(directory: string, fs: FileSystem = new NodeFileSystem()) {
    const usersFile = path.join(directory, FILENAME);
    let buf: Buffer | null = null;
    if (await fs.exists(usersFile)) {
      buf = await fs.readFile(usersFile);
    }
    return new UsersFile(buf, usersFile, fs);
  }

  static forBuffer(buf: Buffer, fs: FileSystem = new NodeFileSystem()) {
    return new UsersFile(buf, undefined, fs);
  }

  isInitialized() {
    return !!this.hashedMasterKey;
  }

  isUnlocked() {
    return !!this.masterKey;
  }

  unlock(username: string, privateKey: sshpk.PrivateKey) {
    if (this.isUnlocked()) {
      return;
    }
    if (!this.isInitialized()) {
      throw new Error('not initialized');
    }
    if (!this.encryptedKeys[username]) {
      throw new Error(`user ${username} not authorized`);
    }

    this.masterKey = decryptMasterKey(this.hashedMasterKey, this.encryptedKeys[username], privateKey);
    if (!this.masterKey) {
      throw new Error('unlock failed, invalid key?');
    }
  }

  lock() {
    this.masterKey = null;
  }

  init(keyProvider: KeyProvider) {
    if (this.isInitialized() && !this.isUnlocked()) {
      throw new Error('need to unlock for reinit');
    }

    this.masterKey = crypto.randomBytes(ALG_KEY_BYTES);
    this.hashedMasterKey = hashMasterKey(this.masterKey);

    this.bulkAuthorize(Object.keys(this.encryptedKeys), keyProvider);
  }

  authorize(username: string, publicKey: sshpk.Key) {
    if (!this.isUnlocked() || !this.masterKey) {
      throw new Error('need to unlock first');
    }
    this.encryptedKeys[username] = encryptMasterKey(this.masterKey, publicKey);
    console.log(`authorized ${username}`);
  }

  bulkAuthorize(users: string[], keyProvider: KeyProvider) {
    for (const username of users) {
      const userKey = keyProvider.getKey(username);
      if (userKey) {
        this.authorize(username, userKey);
      }
    }
  }

  unauthorize(username: string) {
    if (!this.encryptedKeys[username]) {
      return;
    }
    delete this.encryptedKeys[username];
    console.log(`unauthorized ${username}`);
  }

  internalAdd(username: string, encryptedKey: Buffer) {
    this.encryptedKeys[username] = encryptedKey;
  }

  internalGet(username: string): Buffer | null {
    return this.encryptedKeys[username];
  }

  listUsers() {
    return Object.keys(this.encryptedKeys);
  }

  async save(): Promise<void> {
    const buffer = this.writeBuffer();
    if (buffer) {
      await this.fs.writeFile(this.usersFile, buffer);
    } else if (await this.fs.exists(this.usersFile)) {
      await this.fs.unlink(this.usersFile);
    }
  }

  writeBuffer() {
    if (!this.isInitialized() || !this.listUsers().length) {
      return null;
    }

    const serUsersfile: FileFormat = {
      hashedMasterKey: this.hashedMasterKey.toString('base64'),
      encryptedKeys: {}
    };
    for (const username of Object.keys(this.encryptedKeys)) {
      serUsersfile.encryptedKeys[username] = this.encryptedKeys[username].toString('base64');
    }
    return Buffer.from(JSON.stringify(serUsersfile, null, '  '));
  }

  getMasterKey(): Buffer | null {
    return this.masterKey;
  }

  getHashedMasterKey(): Buffer | null {
    return this.hashedMasterKey;
  }

  reset(): void {
    delete this.hashedMasterKey;
    delete this.masterKey;
    this.encryptedKeys = {};
  }
}
