import EntryPtr from './EntryPtr';
import Node from './Node';

export default class FileListEntry {
  readonly ptr: EntryPtr;
  readonly nodes: Node[];
  readonly lastModified: Date;
  readonly accessible: boolean;

  constructor(ptr: EntryPtr, nodes: Node[], lastModified: Date, accessible: boolean) {
    this.ptr = ptr;
    this.nodes = nodes;
    this.lastModified = lastModified;
    this.accessible = accessible;
  }
}
