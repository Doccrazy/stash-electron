import * as path from 'path';
import EntryPtr from './EntryPtr';
import Node from './Node';

const URL_PROTOCOL = 'stash:';

export default class StashLink {
  readonly nodeId: string;
  readonly entry?: string;

  constructor(nodeOrEntry: string | Node | EntryPtr, entry?: string) {
    if (nodeOrEntry instanceof EntryPtr) {
      this.nodeId = nodeOrEntry.nodeId;
      this.entry = nodeOrEntry.entry;
    } else {
      this.nodeId = typeof nodeOrEntry === 'string' ? nodeOrEntry : nodeOrEntry.id;
      this.entry = entry;
    }
  }

  static parse(href: string) {
    if (!href || !href.startsWith(`${URL_PROTOCOL}/`)) {
      throw new Error('Not a Stash URL');
    }

    const normalized = path.posix.normalize(decodeURI(href.substr(URL_PROTOCOL.length)));
    const entry = normalized.split('/').pop() || '';
    const nodeId = normalized.substr(0, normalized.length - entry.length);
    return entry ? new StashLink(nodeId, entry) : new StashLink(nodeId);
  }

  toUri() {
    const fullPath = this.entry ? path.posix.join(this.nodeId, this.entry) : this.nodeId;
    return `${URL_PROTOCOL}/${encodeURI(fullPath)}`;
  }

  isEntry() {
    return !!this.entry;
  }

  isNode() {
    return !this.entry;
  }

  toEntryPtr() {
    if (!this.isEntry()) {
      throw new Error('Link does not represent an entry');
    }
    return new EntryPtr(this.nodeId, this.entry!);
  }
}
