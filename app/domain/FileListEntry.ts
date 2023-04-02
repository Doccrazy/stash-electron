import { Details } from '../actions/types/entryDetails';
import EntryPtr from './EntryPtr';
import Node from './Node';

export default interface FileListEntry {
  readonly ptr: EntryPtr;
  readonly path: Node[];
  readonly details?: Details;
  readonly accessible?: boolean;
  readonly groupIndex?: number;
  readonly highlightHtml?: string;
}
