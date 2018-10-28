import { hashString } from '../utils/hash';
import Node from './Node';

export default class EntryPtr {
  readonly nodeId: string;
  readonly entry: string;

  constructor(node: string | Node, entry: string) {
    this.nodeId = typeof node === 'string' ? node : node.id;
    this.entry = entry;
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
}
