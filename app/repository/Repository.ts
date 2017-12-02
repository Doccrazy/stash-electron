import Node from '../domain/Node';

export default interface Repository {
  readonly rootPath: string;
  readonly name: string;

  readNode(nodeId: string): Promise<Node>;

  createNode(parentId: string, newNodeName: string): Promise<Node>;
  renameNode(nodeId: string, newName: string): Promise<string>;
  moveNode(nodeId: string, newParentId: string): Promise<string>
  deleteNode(nodeId: string): Promise<void>;
  setAuthorizedUsers(nodeId: string, users?: string[]): Promise<void>;

  renameFile(nodeId: string, oldName: string, newName: string): Promise<void>;
  deleteFile(nodeId: string, name: string): Promise<void>;

  readFile(nodeId: string, fileName: string): Promise<Buffer>;
  writeFile(nodeId: string, fileName: string, buffer: Buffer): Promise<void>;
}
