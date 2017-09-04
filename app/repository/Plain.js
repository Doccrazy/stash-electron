import fs from 'fs-extra';
import path from 'path';
import { Map, List } from 'immutable';
import { isValidFileName } from '../utils/repository';

function assertSubPath(parent, child) {
  if (!child.startsWith(parent)) {
    throw new Error(`${child} is not a subpath of ${parent}`);
  }
}

/**
 * Plain, unencrypted repository using a file system folder. Use only for development!
 */
export default class PlainRepository {
  constructor(rootPath) {
    this._rootPath = path.normalize(rootPath);
    this._name = path.parse(this._rootPath).name;
  }

  get rootPath() {
    return this._rootPath;
  }

  get name() {
    return this._name;
  }

  async readdir(subPath) {
    const dirPath = path.join(this._rootPath, subPath);
    assertSubPath(this._rootPath, dirPath);

    console.time('readdirSync');
    // const files = fs.readdirSync(dirPath);
    const files = await fs.readdir(dirPath);
    console.timeEnd('readdirSync');
    console.time(`stat x${files.length}`);
    const fileStats = await Promise.all(files.map(fn => fs.stat(path.join(dirPath, fn))));
    console.timeEnd(`stat x${files.length}`);

    let entries = new List();
    let children = new List();

    files.forEach((file, idx) => {
      const stat = fileStats[idx];
      // const stat = fs.statSync(path.join(dirPath, file));

      if (stat.isFile()) {
        entries = entries.push(new Map({
          name: file,
          size: stat.size
        }));
      } else if (stat.isDirectory()) {
        children = children.push(file);
      }
    });

    return new Map({
      entries,
      children
    });
  }

  async renameFile(subPath, oldName, newName) {
    await this._rename(subPath, oldName, newName);
  }

  async renameDir(subPath, oldName, newName) {
    await this._rename(subPath, oldName, newName);
  }

  async _rename(subPath, oldName, newName) {
    const absPath = path.join(this._rootPath, subPath, oldName);
    assertSubPath(this._rootPath, absPath);
    const newPath = path.join(this._rootPath, subPath, newName);
    assertSubPath(this._rootPath, newPath);

    await fs.rename(absPath, newPath);
  }

  async deleteFile(subPath, name) {
    const absPath = path.join(this._rootPath, subPath, name);
    assertSubPath(this._rootPath, absPath);

    const stat = await fs.stat(absPath);
    if (!stat.isFile()) {
      throw new Error(`Not a file: ${name} in ${subPath}`);
    }

    await fs.unlink(absPath);
  }

  async deleteDir(subPath) {
    const absPath = path.join(this._rootPath, subPath);
    assertSubPath(this._rootPath, absPath);

    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${subPath}`);
    }

    await fs.remove(absPath);
  }

  async createDir(subPath, newDirName) {
    const absPath = path.join(this._rootPath, subPath);
    assertSubPath(this._rootPath, absPath);
    if (!isValidFileName(newDirName)) {
      throw new Error(`Invalid filename: ${newDirName}`);
    }

    const stat = await fs.stat(absPath);
    if (!stat.isDirectory()) {
      throw new Error(`Not a directory: ${subPath}`);
    }

    const newPath = path.join(absPath, newDirName);

    await fs.mkdir(newPath);
  }

  readFile(subPath, fileName) {
    const absPath = path.join(this._rootPath, subPath);
    assertSubPath(this._rootPath, absPath);
    if (!isValidFileName(fileName)) {
      throw new Error(`Invalid filename: ${fileName}`);
    }

    return fs.readFile(path.join(absPath, fileName));
  }

  async writeFile(subPath, fileName, buffer) {
    const absPath = path.join(this._rootPath, subPath);
    assertSubPath(this._rootPath, absPath);
    if (!isValidFileName(fileName)) {
      throw new Error(`Invalid filename: ${fileName}`);
    }

    await fs.writeFile(path.join(absPath, fileName), buffer);
  }
}