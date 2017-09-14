import * as fs from 'fs-extra';
import * as path from 'path';
import { List } from 'immutable';
import { isValidFileName } from '../utils/repository';
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

      if (stat.isFile()) {
        entries.push(file);
      } else if (stat.isDirectory()) {
        children.push(makeId(nodeId, file));
      }
    });

    return new Node({ id: nodeId, name, parentId, childIds: children, entries });
  }

  async readNodeRecursive(nodeId: string): Promise<List<Node>> {
    console.time('readNodeRecursive');
    (process as any).noAsar = true;

    let result: Node[] = [];
    let readQueue = [nodeId];

    while (readQueue.length) {
      const readNodes = await Promise.all(readQueue.map(n => this.readNode(n)));
      result = result.concat(readNodes);
      readQueue = readNodes.reduce((acc: string[], n: Node) => acc.concat(n.childIds.toArray()), []);
    }

    (process as any).noAsar = false;

    console.timeEnd('readNodeRecursive');
    console.log(result.length);
    return List(result);
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

  async deleteNode(nodeId: string) {
    const absPath = path.join(this.rootPath, nodeId);
    assertSubPath(this.rootPath, absPath);

    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${nodeId}`);
    }

    await fs.remove(absPath);
  }

  async renameFile(nodeId: string, oldName: string, newName: string): Promise<void> {
    await this.rename(path.join(nodeId, oldName), path.join(nodeId, newName));
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

  private async rename(oldPath: string, newPath: string) {
    const absPath = path.join(this.rootPath, oldPath);
    assertSubPath(this.rootPath, absPath);
    const newAbsPath = path.join(this.rootPath, newPath);
    assertSubPath(this.rootPath, newAbsPath);

    await fs.rename(absPath, newAbsPath);
  }
}
