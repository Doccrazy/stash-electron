import EntryPtr from './EntryPtr';

export default class FileListEntry {
  readonly ptr: EntryPtr;
  readonly nodeNames: string[];
  readonly lastModified: Date;
  readonly accessible: boolean;

  constructor(ptr: EntryPtr, nodeNames: string[], lastModified: Date, accessible: boolean) {
    this.ptr = ptr;
    this.nodeNames = nodeNames;
    this.lastModified = lastModified;
    this.accessible = accessible;
  }
}
