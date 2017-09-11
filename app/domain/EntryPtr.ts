import * as path from 'path';
import { URL } from 'url';
import { hashString } from '../utils/hash';
import Node from './Node';

export default class EntryPtr {
  readonly nodeId: string;
  readonly entry: string;

  constructor(node: string | Node, entry: string) {
    this.nodeId = typeof node === 'string' ? node : node.id;
    this.entry = entry;
  }

  static fromHref(href: string) {
    const url = new URL(href);
    if (url.protocol !== 'stash:' || url.host || url.port) {
      throw new Error('Not a Stash URL');
    } else if (!url.pathname || url.pathname === '/') {
      throw new Error('Missing entry path');
    }

    const parts = path.posix.parse(decodeURI(url.pathname));
    if (!parts.dir) {
      throw new Error('Missing node');
    }
    return new EntryPtr(`${parts.dir}/`, parts.base);
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
    return `stash:${encodeURI(fullPath)}`;
  }
}
