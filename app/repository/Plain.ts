import * as path from 'path';
import { isValidFileName, RESERVED_FILENAMES } from '../utils/repository';
import Node, { ROOT_ID } from '../domain/Node';
import FileSystem from './fs/FileSystem';
import NodeFileSystem from './fs/NodeFileSystem';
import Repository from './Repository';

function assertSubPath(parent: string, child: string) {
  if (!child.startsWith(parent)) {
    throw new Error(`${child} is not a subpath of ${parent}`);
  }
}

function makeId(parentNodeId: string, childName: string) {
  return `${parentNodeId}${childName}/`;
}

/**
 * Plain, unencrypted repository using a file system folder. Use only for development!
 */
export default class PlainRepository implements Repository {
  readonly rootPath: string;
  readonly name: string;

  constructor(
    rootPath: string,
    private readonly fs: FileSystem = new NodeFileSystem()
  ) {
    this.rootPath = path.normalize(rootPath);
    this.name = path.parse(this.rootPath).name;
  }

  async readNode(nodeId: string): Promise<Node> {
    const dirPath = path.join(this.rootPath, nodeId);
    assertSubPath(this.rootPath, dirPath);
    let name = this.name;
    let parentId;
    if (nodeId !== ROOT_ID) {
      const parsed = path.posix.parse(nodeId);
      name = parsed.base;
      parentId = parsed.dir === ROOT_ID ? ROOT_ID : `${parsed.dir}/`;
    }

    const files = await this.fs.readdir(dirPath);
    const fileStats = await Promise.all(files.map((fn) => this.fs.stat(path.join(dirPath, fn))));

    const entries: string[] = [];
    const children: string[] = [];

    files.forEach((file, idx) => {
      const stat = fileStats[idx];

      if (!RESERVED_FILENAMES.includes(file.toLowerCase())) {
        if (stat.isFile()) {
          entries.push(file);
        } else if (stat.isDirectory()) {
          children.push(makeId(nodeId, file));
        }
      }
    });

    return new Node({ id: nodeId, name, parentId, childIds: children, entries });
  }

  async createNode(parentNodeId: string, newNodeName: string) {
    const absPath = path.join(this.rootPath, parentNodeId);
    assertSubPath(this.rootPath, absPath);
    if (!isValidFileName(newNodeName)) {
      throw new Error(`Invalid filename: ${newNodeName}`);
    }

    const stat = await this.fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${parentNodeId}`);
    }

    const newPath = path.join(absPath, newNodeName);

    await this.fs.mkdir(newPath);

    return new Node({ id: makeId(parentNodeId, newNodeName), name: newNodeName, parentId: parentNodeId });
  }

  async renameNode(nodeId: string, newName: string): Promise<string> {
    const node = await this.readNode(nodeId);
    if (!node.parentId) {
      throw new Error('Cannot rename root node');
    }

    await this.rename(node.id, path.join(node.parentId, newName));

    return makeId(node.parentId, newName);
  }

  async moveNode(nodeId: string, newParentId: string): Promise<string> {
    if (nodeId === ROOT_ID) {
      throw new Error('Cannot move root node');
    }
    const name = path.posix.parse(nodeId).base;

    const dirPath = path.join(this.rootPath, nodeId);
    const newDirPath = path.join(this.rootPath, newParentId, name);

    if (await this.fs.exists(newDirPath)) {
      throw new Error(`Move failed: ${name} already exists`);
    }

    await this.fs.move(dirPath, newDirPath);

    return makeId(newParentId, name);
  }

  async mergeNode(nodeId: string, targetNodeId: string): Promise<void> {
    if (nodeId === ROOT_ID) {
      throw new Error('Cannot move root node');
    }

    if (nodeId.startsWith(targetNodeId)) {
      // rename source node to avoid possible conflicts when merging into parent
      const tempName = `__tmp${Date.now()}`;
      nodeId = await this.renameNode(nodeId, tempName);
    }

    const node = await this.readNode(nodeId);
    const targetNode = await this.readNode(targetNodeId);

    // move entries to target
    await Promise.all(node.entries.map((entry: string) => this.moveFile(nodeId, entry, targetNodeId)).toArray());

    // move or merge folders to target
    await Promise.all(
      node.childIds
        .map((childId: string): Promise<any> => {
          const name = path.posix.parse(childId).base;
          const existingId = targetNode.childIds.find((cid) => path.posix.parse(cid).base.toLowerCase() === name.toLowerCase());
          if (existingId) {
            return this.mergeNode(childId, existingId);
          } else {
            return this.moveNode(childId, targetNodeId);
          }
        })
        .toArray()
    );

    await this.deleteNode(nodeId);
  }

  async deleteNode(nodeId: string) {
    const absPath = path.join(this.rootPath, nodeId);
    assertSubPath(this.rootPath, absPath);

    const stat = await this.fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${nodeId}`);
    }

    await this.fs.remove(absPath);
  }

  async setAuthorizedUsers(nodeId: string, users?: string[]): Promise<void> {
    // not supported
  }

  async renameFile(nodeId: string, oldName: string, newName: string): Promise<void> {
    await this.rename(this.resolvePath(nodeId, oldName), this.resolvePath(nodeId, newName));
  }

  async moveFile(nodeId: string, name: string, targetNodeId: string): Promise<void> {
    await this.rename(this.resolvePath(nodeId, name), this.resolvePath(targetNodeId, name), true);
  }

  async deleteFile(nodeId: string, name: string): Promise<void> {
    const absPath = this.resolveAbsPath(nodeId, name);

    const stat = await this.fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${name} in ${nodeId}`);
    }

    await this.fs.unlink(absPath);
  }

  resolveAbsPath(nodeId: string, fileName: string): string {
    const relativePath = this.resolvePath(nodeId, fileName);
    const absPath = path.join(this.rootPath, relativePath);
    assertSubPath(this.rootPath, absPath);
    return absPath;
  }

  resolvePath(nodeId: string, fileName?: string): string {
    if (fileName && !isValidFileName(fileName)) {
      throw new Error(`Invalid filename: ${fileName}`);
    }
    return (fileName ? path.posix.join(nodeId, fileName) : nodeId).substr(1);
  }

  unresolvePath(resolvedPath: string) {
    const parsed = path.posix.parse(resolvedPath);
    return { nodeId: `/${parsed.dir}`, fileName: parsed.base };
  }

  readFile(nodeId: string, fileName: string) {
    return this.fs.readFile(this.resolveAbsPath(nodeId, fileName));
  }

  async writeFile(nodeId: string, fileName: string, buffer: Buffer) {
    await this.fs.writeFile(this.resolveAbsPath(nodeId, fileName), buffer);
  }

  private async rename(oldPath: string, newPath: string, overwrite?: boolean) {
    const absPath = path.join(this.rootPath, oldPath);
    assertSubPath(this.rootPath, absPath);
    const newAbsPath = path.join(this.rootPath, newPath);
    assertSubPath(this.rootPath, newAbsPath);

    await this.fs.move(absPath, newAbsPath, { overwrite });
  }
}
