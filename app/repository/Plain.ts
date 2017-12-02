import * as fs from 'fs-extra';
import * as path from 'path';
import { isValidFileName, RESERVED_FILENAMES } from '../utils/repository';
import Node, { ROOT_ID } from '../domain/Node';
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

  constructor(rootPath: string) {
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

    const files = await fs.readdir(dirPath);
    const fileStats = await Promise.all(files.map(fn => fs.stat(path.join(dirPath, fn))));

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

    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${parentNodeId}`);
    }

    const newPath = path.join(absPath, newNodeName);

    await fs.mkdir(newPath);

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

    if (fs.existsSync(newDirPath)) {
      throw new Error(`Move failed: ${name} already exists`);
    }

    await fs.move(dirPath, newDirPath);

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
    await Promise.all(node.childIds.map((childId: string): Promise<any> => {
      const name = path.posix.parse(childId).base;
      const existingId = targetNode.childIds.find(cid => path.posix.parse(cid!).base.toLowerCase() === name.toLowerCase());
      if (existingId) {
        return this.mergeNode(childId, existingId);
      } else {
        return this.moveNode(childId, targetNodeId);
      }
    }).toArray());

    await this.deleteNode(nodeId);
  }

  async deleteNode(nodeId: string) {
    const absPath = path.join(this.rootPath, nodeId);
    assertSubPath(this.rootPath, absPath);

    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${nodeId}`);
    }

    await fs.remove(absPath);
  }

  async setAuthorizedUsers(nodeId: string, users?: string[]): Promise<void> {
    // not supported
  }

  async renameFile(nodeId: string, oldName: string, newName: string): Promise<void> {
    await this.rename(path.join(nodeId, oldName), path.join(nodeId, newName));
  }

  async moveFile(nodeId: string, name: string, targetNodeId: string): Promise<void> {
    await this.rename(path.join(nodeId, name), path.join(targetNodeId, name), true);
  }

  async deleteFile(nodeId: string, name: string): Promise<void> {
    const absPath = path.join(this.rootPath, nodeId, name);
    assertSubPath(this.rootPath, absPath);

    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${name} in ${nodeId}`);
    }

    await fs.unlink(absPath);
  }

  readFile(nodeId: string, fileName: string) {
    const absPath = path.join(this.rootPath, nodeId);
    assertSubPath(this.rootPath, absPath);
    if (!isValidFileName(fileName)) {
      throw new Error(`Invalid filename: ${fileName}`);
    }

    return fs.readFile(path.join(absPath, fileName));
  }

  async writeFile(nodeId: string, fileName: string, buffer: Buffer) {
    const absPath = path.join(this.rootPath, nodeId);
    assertSubPath(this.rootPath, absPath);
    if (!isValidFileName(fileName)) {
      throw new Error(`Invalid filename: ${fileName}`);
    }

    await fs.writeFile(path.join(absPath, fileName), buffer);
  }

  private async rename(oldPath: string, newPath: string, overwrite?: boolean) {
    const absPath = path.join(this.rootPath, oldPath);
    assertSubPath(this.rootPath, absPath);
    const newAbsPath = path.join(this.rootPath, newPath);
    assertSubPath(this.rootPath, newAbsPath);

    await fs.move(absPath, newAbsPath, { overwrite });
  }
}
