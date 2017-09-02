import { hash } from 'immutable';

export function hierarchy(nodes, nodeId) {
  const result = [];
  if (nodeId) {
    let n = nodes[nodeId];
    while (n) {
      result.unshift(n);
      n = nodes[n.parent];
    }
  }
  return result;
}

export function isValidFileName(fn: string) {
  return fn && !/[/\\:*?"<>|]/.test(fn);
}

export class EntryPtr {
  constructor(node, entry) {
    if (typeof node === 'string') {
      this.nodeId = node;
    } else {
      this.nodeId = node.id;
    }
    this.entry = entry;
  }

  static assert(obj) {
    if (!(obj instanceof EntryPtr)) {
      throw new Error('expected EntryPtr');
    }
  }

  equals(other) {
    return other instanceof EntryPtr && other.nodeId === this.nodeId && other.entry === this.entry;
  }

  hashCode() {
    return hash(`${this.nodeId}/${this.entry}`);
  }
}
