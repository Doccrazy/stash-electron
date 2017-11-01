import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as sshpk from 'sshpk';
import {ALG_KEY_BYTES} from '../utils/cryptoStream';
import KeyProvider from './KeyProvider';

const FILENAME = '.users.json';

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
  private encryptedKeys: {[username: string]: Buffer};
  private hashedMasterKey: Buffer;
  private masterKey: Buffer | null;

  constructor(directory: string) {
    this.usersFile = path.join(directory, FILENAME);
    this.encryptedKeys = {};
    if (fs.existsSync(this.usersFile)) {
      const parsedFile: FileFormat = JSON.parse(fs.readFileSync(this.usersFile, 'utf8'));
      this.hashedMasterKey = Buffer.from(parsedFile.hashedMasterKey, 'base64');
      for (const username of Object.keys(parsedFile.encryptedKeys)) {
        this.encryptedKeys[username] = Buffer.from(parsedFile.encryptedKeys[username], 'base64');
      }
    }
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

  listUsers() {
    return Object.keys(this.encryptedKeys);
  }

  save() {
    if (!this.isInitialized() || !this.listUsers().length) {
      if (fs.existsSync(this.usersFile)) {
        fs.unlinkSync(this.usersFile);
      }
      return;
    }

    const serUsersfile: FileFormat = {
      hashedMasterKey: this.hashedMasterKey.toString('base64'),
      encryptedKeys: {}
    };
    for (const username of Object.keys(this.encryptedKeys)) {
      serUsersfile.encryptedKeys[username] = this.encryptedKeys[username].toString('base64');
    }
    fs.writeFileSync(this.usersFile, JSON.stringify(serUsersfile, null, '  '));
  }

  getMasterKey(): Buffer | null {
    return this.masterKey;
  }

  reset(): void {
    delete this.hashedMasterKey;
    delete this.masterKey;
    this.encryptedKeys = {};
  }
}
