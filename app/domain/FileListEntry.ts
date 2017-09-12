import EntryPtr from './EntryPtr';

export default class FileListEntry {
  readonly ptr: EntryPtr;
  readonly nodeNames: string[];
  readonly lastModified: Date;

  constructor(ptr: EntryPtr, nodeNames: string[], lastModified: Date) {
    this.ptr = ptr;
    this.nodeNames = nodeNames;
    this.lastModified = lastModified;
  }
}
