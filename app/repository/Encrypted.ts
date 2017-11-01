import PlainRepository from './Plain';
import Node from '../domain/Node';
import AuthorizationProvider from './AuthorizationProvider';
import RecursiveAuthProviderWrapper from './RecursiveAuthProviderWrapper';
import {decipherSync, encipherSync} from '../utils/cryptoStream';
import {readNodeRecursive} from '../utils/repository';
import {List} from 'immutable';

export default class EncryptedRepository extends PlainRepository {
  private readonly recAuthProvider: RecursiveAuthProviderWrapper;

  constructor(rootPath: string, private readonly authProvider: AuthorizationProvider) {
    super(rootPath);
    this.recAuthProvider = new RecursiveAuthProviderWrapper(authProvider);
  }

  async readNode(nodeId: string): Promise<Node> {
    const node = await super.readNode(nodeId);

    let authorizedUsers: string[] | undefined = this.authProvider.getAuthorizedUsers(nodeId);
    if (!authorizedUsers.length) {
      authorizedUsers = undefined;
    }

    // only show encrypted files, remove .enc extension
    const entries = node.entries
      .filter((fn: string) => fn.endsWith('.enc'))
      .map((fn: string) => fn.substr(0, fn.length - 4));

    return new Node({...node, entries, authorizedUsers});
  }

  async setAuthorizedUsers(nodeId: string, users?: string[]): Promise<void> {
    // find all nodes that will be affected by the operation, stopping if child node has overridden auth users
    const affectedNodes = await readNodeRecursive(id => this.readNode(id), nodeId,
        node => node.id === nodeId || !node.authorizedUsers || !node.authorizedUsers.size);
    const entryCount = affectedNodes.map((n: Node) => n.entries.size).reduce((acc: number, v: number) => acc + v, 0);
    if (!entryCount) {
      // if no entries are affected, we can just set the users without masterkey access
      this.authProvider.setAuthorizedUsers(nodeId, []);
      if (users && users.length) {
        this.authProvider.setAuthorizedUsers(nodeId, users);
      }
      return;
    }

    const oldMasterKey = this.recAuthProvider.getMasterKey(nodeId);
    this.authProvider.setAuthorizedUsers(nodeId, users || []);
    const newMasterKey = this.recAuthProvider.getMasterKey(nodeId);
    if (oldMasterKey && !oldMasterKey.equals(newMasterKey)) {
      await this.reencrypt(affectedNodes, oldMasterKey, newMasterKey);
    }
  }

  readFile(nodeId: string, fileName: string): Promise<Buffer> {
    const masterKey = this.recAuthProvider.getMasterKey(nodeId);

    return this.readAndDecipher(nodeId, fileName, masterKey);
  }

  writeFile(nodeId: string, fileName: string, buffer: Buffer): Promise<any> {
    const masterKey = this.recAuthProvider.getMasterKey(nodeId);

    return this.writeAndEncipher(nodeId, fileName, buffer, masterKey);
  }

  private async readAndDecipher(nodeId: string, fileName: string, masterKey: Buffer) {
    const buffer = await super.readFile(nodeId, `${fileName}.enc`);
    return decipherSync(masterKey, buffer);
  }

  private writeAndEncipher(nodeId: string, fileName: string, buffer: Buffer, masterKey: Buffer): Promise<void> {
    const encBuffer = encipherSync(masterKey, buffer);
    return super.writeFile(nodeId, `${fileName}.enc`, encBuffer);
  }

  private async reencrypt(nodes: List<Node>, oldMasterKey: Buffer, newMasterKey: Buffer): Promise<void> {
    for (const node of nodes.toArray()) {
      for (const fileName of node.entries.toArray()) {
        const plainBuffer = await this.readAndDecipher(node.id, fileName, oldMasterKey);
        await this.writeAndEncipher(node.id, fileName, plainBuffer, newMasterKey);
      }
    }
  }
}
