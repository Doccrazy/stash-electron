import * as path from 'path';
import { hashString } from '../utils/hash';
import Node from './Node';

const URL_PROTOCOL = 'stash:';

export default class EntryPtr {
  readonly nodeId: string;
  readonly entry: string;

  constructor(node: string | Node, entry: string) {
    this.nodeId = typeof node === 'string' ? node : node.id;
    this.entry = entry;
  }

  static fromHref(href: string) {
    if (!href || !href.startsWith(URL_PROTOCOL) || href.length < URL_PROTOCOL.length + 3) {
      throw new Error('Not a Stash URL');
    }

    const parts = path.posix.parse(path.posix.normalize(decodeURI(href.substr(URL_PROTOCOL.length))));
    if (!parts.dir) {
      throw new Error('Missing node');
    }
    return new EntryPtr(`${parts.dir}${parts.dir.endsWith('/') ? '' : '/'}`, parts.base);
  }

  equals(other: any) {
    return other instanceof EntryPtr && other.nodeId === this.nodeId && other.entry === this.entry;
  }

  toString() {
    return `${this.nodeId}:${this.entry}`;
  }

  hashCode() {
    return hashString(this.toString());
  }

  toHref() {
    const fullPath = path.posix.join(this.nodeId, this.entry);
    return `${URL_PROTOCOL}/${encodeURI(fullPath)}`;
  }
}
