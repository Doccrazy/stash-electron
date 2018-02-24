import * as SshPK from 'sshpk';

export default interface AuthorizationProvider {
  getAuthorizedUsers(nodeId: string): Promise<string[]>;

  setAuthorizedUsers(nodeId: string, users: string[]): Promise<void>;

  setCurrentUser(key?: SshPK.PrivateKey): void;

  getMasterKey(nodeId: string): Promise<Buffer>;

  resetCaches(): void;
}
