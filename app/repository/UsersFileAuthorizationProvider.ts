import * as path from 'path';
import AuthorizationProvider from './AuthorizationProvider';
import * as SshPK from 'sshpk';
import KeyProvider from './KeyProvider';
import UsersFile from './UsersFile';

export default class UsersFileAuthorizationProvider implements AuthorizationProvider {
  private readonly repoPath: string;
  private readonly keyProvider: KeyProvider;
  private usersFileCache: {[nodeId: string]: UsersFile} = {};

  private currentUsername?: string | null;
  private currentKey?: SshPK.PrivateKey;

  constructor(repoPath: string, keyProvider: KeyProvider) {
    this.repoPath = repoPath;
    this.keyProvider = keyProvider;
  }

  getAuthorizedUsers(nodeId: string): string[] {
    const usersFile = this.getUsersFile(nodeId);
    return usersFile.listUsers();
  }

  setAuthorizedUsers(nodeId: string, users: string[]): void {
    const usersFile = this.getUsersFile(nodeId);
    if (!users.length) {
      usersFile.reset();
    } else if (!usersFile.isInitialized()) {
      usersFile.init(this.keyProvider);
      usersFile.bulkAuthorize(users, this.keyProvider);
    } else {
      const currentUsers = usersFile.listUsers();
      const addedUsers = users.filter(u => currentUsers.indexOf(u) < 0);
      const deletedUsers = currentUsers.filter(u => users.indexOf(u) < 0);

      for (const deletedUser of deletedUsers) {
        usersFile.unauthorize(deletedUser);
      }
      if (deletedUsers.length) {
        usersFile.init(this.keyProvider);
      }
      usersFile.bulkAuthorize(addedUsers, this.keyProvider);
    }
    usersFile.save();
  }

  setCurrentUser(key?: SshPK.PrivateKey): void {
    this.currentUsername = key ? this.keyProvider.findUser(key) : null;
    this.currentKey = this.currentUsername ? key : undefined;
    for (const nodeId of Object.keys(this.usersFileCache)) {
      this.usersFileCache[nodeId].lock();
    }
  }

  getMasterKey(nodeId: string): Buffer {
    if (!this.currentUsername || !this.currentKey) {
      throw new Error('Not logged in');
    }

    const usersFile = this.getUsersFile(nodeId);
    if (!usersFile.isUnlocked()) {
      if (!usersFile.listUsers().includes(this.currentUsername)) {
        throw new Error(`Unauthorized on ${nodeId}`);
      }
      usersFile.unlock(this.currentUsername, this.currentKey);
    }
    return usersFile.getMasterKey() as Buffer;
  }

  private getUsersFile(nodeId: string): UsersFile {
    const cached = this.usersFileCache[nodeId];
    if (cached) {
      return cached;
    }
    const nodeUsersFile = new UsersFile(path.join(this.repoPath, nodeId));
    this.usersFileCache[nodeId] = nodeUsersFile;
    return nodeUsersFile;
  }
}
