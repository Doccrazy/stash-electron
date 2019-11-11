import { Stats } from 'fs';
import { MoveOptions } from 'fs-extra';
import Git from 'nodegit';
import { relative, sep as pathsep } from 'path';
import FileSystem from './FileSystem';

/**
 * Filesystem implementation backed by a specific commit tree in a git repository
 */
export default class GitFileSystem implements FileSystem {
  constructor(private readonly repoPath: string, private readonly gitCommit: Git.Commit) {
  }

  static async create(gitRepo: Git.Repository, commitOid: string): Promise<GitFileSystem> {
    return new GitFileSystem(gitRepo.workdir(), await gitRepo.getCommit(commitOid));
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.gitCommit.getEntry(this.resolve(path));
      return true;
    } catch (e) {
      if (e.message.includes('does not exist')) {
        return false;
      }
      throw e;
    }
  }

  async readdir(path: string): Promise<string[]> {
    const treeEntry = await this.gitCommit.getEntry(this.resolve(path));
    if (!treeEntry.isTree()) {
      throw new Error(`not a directory: ${this.resolve(path)}`);
    }

    const tree = await treeEntry.getTree();
    return tree.entries().map(entry => entry.name());
  }

  async stat(path: string): Promise<Stats> {
    const treeEntry = await this.gitCommit.getEntry(this.resolve(path));

    return new GitStat(treeEntry);
  }

  async readFile(file: string): Promise<Buffer> {
    const treeEntry = await this.gitCommit.getEntry(this.resolve(file));
    if (!treeEntry.isFile()) {
      throw new Error(`not a file: ${this.resolve(file)}`);
    }

    const blob = await treeEntry.getBlob();

    return blob.content();
  }

  resolve(absFilename: string): string {
    let rel = relative(this.repoPath, absFilename);
    if (pathsep === '\\') {
      rel = rel.replace(/\\/g, '/');
    }
    return rel;
  }

  mkdir(path: string): Promise<void> {
    throw new Error('readonly file system');
  }

  move(src: string, dest: string, options?: MoveOptions): Promise<void> {
    throw new Error('readonly file system');
  }

  remove(dir: string): Promise<void> {
    throw new Error('readonly file system');
  }

  unlink(path: string): Promise<void> {
    throw new Error('readonly file system');
  }

  writeFile(file: string, data: Buffer): Promise<void> {
    throw new Error('readonly file system');
  }
}

class GitStat implements Stats { // tslint:disable-line
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  uid: number;
  gid: number;
  rdev: number;
  size: number;
  blksize: number;
  blocks: number;
  atimeMs: number;
  mtimeMs: number;
  ctimeMs: number;
  birthtimeMs: number;
  atime: Date;
  mtime: Date;
  ctime: Date;
  birthtime: Date;

  file: boolean;
  directory: boolean;

  constructor(treeEntry: Git.TreeEntry) {
    this.file = treeEntry.isFile();
    this.directory = treeEntry.isTree();
  }

  isFile(): boolean {
    return this.file;
  }

  isDirectory(): boolean {
    return this.directory;
  }

  isBlockDevice(): boolean {
    return false;
  }

  isCharacterDevice(): boolean {
    return false;
  }

  isSymbolicLink(): boolean {
    return false;
  }

  isFIFO(): boolean {
    return false;
  }

  isSocket(): boolean {
    return false;
  }
}
