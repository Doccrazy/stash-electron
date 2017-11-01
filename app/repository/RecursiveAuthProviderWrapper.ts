import * as path from 'path';
import {ROOT_ID} from '../domain/Node';
import AuthorizationProvider from './AuthorizationProvider';

export interface AuthInfo {
  users: string[],
  authNodeId?: string
}

export default class RecursiveAuthProviderWrapper {
  private readonly authProvider: AuthorizationProvider;

  constructor(authProvider: AuthorizationProvider) {
    this.authProvider = authProvider;
  }

  getAuthorizedUsers(nodeId: string): AuthInfo {
    let users = this.authProvider.getAuthorizedUsers(nodeId);
    let authNodeId: string | undefined;
    while (!users.length && nodeId !== ROOT_ID) {
      nodeId = parentNodeId(nodeId);
      users = this.authProvider.getAuthorizedUsers(nodeId);
      authNodeId = nodeId;
    }
    return {users, authNodeId};
  }

  getMasterKey(nodeId: string): Buffer {
    const authInfo = this.getAuthorizedUsers(nodeId);
    return this.authProvider.getMasterKey(authInfo.authNodeId || nodeId);
  }
}

function parentNodeId(nodeId: string): string {
  const parsed = path.posix.parse(nodeId);
  return parsed.dir === ROOT_ID ? ROOT_ID : `${parsed.dir}/`;
}
