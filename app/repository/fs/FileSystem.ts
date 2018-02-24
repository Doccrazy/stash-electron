import { Stats } from 'fs';
import { MoveOptions } from 'fs-extra';

export default interface FileSystem {
  exists(path: string): Promise<boolean>

  readdir(path: string): Promise<string[]>

  stat(path: string): Promise<Stats>

  mkdir(path: string): Promise<void>

  move(src: string, dest: string, options?: MoveOptions): Promise<void>

  remove(dir: string): Promise<void>

  unlink(path: string): Promise<void>

  readFile(file: string): Promise<Buffer>

  writeFile(file: string, data: Buffer): Promise<void>
}
