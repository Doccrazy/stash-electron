import * as path from 'path';
import AuthorizationProvider from './AuthorizationProvider';
import * as SshPK from 'sshpk';
import FileSystem from './fs/FileSystem';
import NodeFileSystem from './fs/NodeFileSystem';
import KeyProvider from './KeyProvider';
import UsersFile from './UsersFile';

export default class UsersFileAuthorizationProvider implements AuthorizationProvider {
  private readonly repoPath: string;
  private readonly keyProvider: KeyProvider;
  private usersFileCache: { [nodeId: string]: UsersFile } = {};

  private currentUsername?: string | null;
  private currentKey?: SshPK.PrivateKey;

  constructor(
    repoPath: string,
    keyProvider: KeyProvider,
    private readonly fs: FileSystem = new NodeFileSystem()
  ) {
    this.repoPath = repoPath;
    this.keyProvider = keyProvider;
  }

  async getAuthorizedUsers(nodeId: string): Promise<string[]> {
    const usersFile = await this.getUsersFile(nodeId);
    return usersFile.listUsers();
  }

  async setAuthorizedUsers(nodeId: string, users: string[]): Promise<void> {
    const usersFile = await this.getUsersFile(nodeId);
    if (!users.length) {
      usersFile.reset();
    } else if (!usersFile.isInitialized()) {
      usersFile.init(this.keyProvider);
      usersFile.bulkAuthorize(users, this.keyProvider);
    } else {
      const currentUsers = usersFile.listUsers();
      const addedUsers = users.filter((u) => !currentUsers.includes(u));
      const deletedUsers = currentUsers.filter((u) => !users.includes(u));

      for (const deletedUser of deletedUsers) {
        usersFile.unauthorize(deletedUser);
      }
      if (deletedUsers.length) {
        usersFile.init(this.keyProvider);
      }
      usersFile.bulkAuthorize(addedUsers, this.keyProvider);
    }
    await usersFile.save();
  }

  setCurrentUser(key?: SshPK.PrivateKey): void {
    this.currentUsername = key ? this.keyProvider.findUser(key) : null;
    this.currentKey = this.currentUsername ? key : undefined;
    for (const nodeId of Object.keys(this.usersFileCache)) {
      this.usersFileCache[nodeId].lock();
    }
  }

  async getMasterKey(nodeId: string): Promise<Buffer> {
    if (!this.currentUsername || !this.currentKey) {
      throw new Error('Not logged in');
    }

    const usersFile = await this.getUsersFile(nodeId);
    if (!usersFile.isUnlocked()) {
      if (!usersFile.listUsers().includes(this.currentUsername)) {
        throw new Error(`Unauthorized on ${nodeId}`);
      }
      usersFile.unlock(this.currentUsername, this.currentKey);
    }
    return usersFile.getMasterKey() as Buffer;
  }

  resetCaches(): void {
    for (const nodeId of Object.keys(this.usersFileCache)) {
      this.usersFileCache[nodeId].lock();
    }
    this.usersFileCache = {};
  }

  private async getUsersFile(nodeId: string): Promise<UsersFile> {
    const cached = this.usersFileCache[nodeId];
    if (cached) {
      return cached;
    }
    const nodeUsersFile = await UsersFile.forDirectory(path.join(this.repoPath, nodeId), this.fs);
    this.usersFileCache[nodeId] = nodeUsersFile;
    return nodeUsersFile;
  }
}
