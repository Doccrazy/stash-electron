import { Stats } from 'fs';
import * as fs from 'fs-extra';
import FileSystem from './FileSystem';

/**
 * Default filesystem implementation using node functions
 */
export default class NodeFileSystem implements FileSystem {
  // eslint-disable-next-line @typescript-eslint/require-await
  async exists(path: string): Promise<boolean> {
    return fs.existsSync(path);
  }

  readdir(path: string): Promise<string[]> {
    return fs.readdir(path);
  }

  stat(path: string): Promise<Stats> {
    return fs.stat(path);
  }

  mkdir(path: string): Promise<void> {
    return fs.mkdir(path);
  }

  move(src: string, dest: string, options?: fs.MoveOptions): Promise<void> {
    return fs.move(src, dest, options);
  }

  remove(dir: string): Promise<void> {
    return fs.remove(dir);
  }

  unlink(path: string): Promise<void> {
    return fs.unlink(path);
  }

  readFile(file: string): Promise<Buffer> {
    return fs.readFile(file);
  }

  writeFile(file: string, data: Buffer): Promise<void> {
    return fs.writeFile(file, data);
  }
}
