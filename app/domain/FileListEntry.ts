import {Details} from '../actions/types/entryDetails';
import EntryPtr from './EntryPtr';
import Node from './Node';

export default class FileListEntry {
  readonly ptr: EntryPtr;
  readonly nodes: Node[];
  readonly details?: Details;
  readonly accessible?: boolean;

  constructor(ptr: EntryPtr, nodes: Node[], details?: Details, accessible?: boolean) {
    this.ptr = ptr;
    this.nodes = nodes;
    this.details = details;
    this.accessible = accessible;
  }
}
