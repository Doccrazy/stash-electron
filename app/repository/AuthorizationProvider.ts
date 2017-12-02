import * as SshPK from 'sshpk';

export default interface AuthorizationProvider {
  getAuthorizedUsers(nodeId: string): string[];

  setAuthorizedUsers(nodeId: string, users: string[]): void;

  setCurrentUser(key?: SshPK.PrivateKey): void;

  getMasterKey(nodeId: string): Buffer;

  resetCaches(): void;
}
