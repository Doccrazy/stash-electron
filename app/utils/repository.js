import path from 'path';
import { URL } from 'url';
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

export function recursiveChildIds(nodes, parentId) {
  let result = [parentId];
  const children = nodes[parentId].children || [];
  children.forEach(childId => {
    result = result.concat(recursiveChildIds(nodes, childId));
  });
  return result;
}

export function isValidFileName(fn: string) {
  return fn && !/[/\\:*?"<>|]/.test(fn);
}

export function cleanFileName(fn: string, replacement: string = '') {
  return fn ? fn.replace(/[/\\:*?"<>|]/g, replacement) : fn;
}

export function hasChildOrEntry(allNodes, node, nameToCheck) {
  return (node.entries && node.entries.find(e => e === nameToCheck))
    || !!childNodeByName(allNodes, node, nameToCheck);
}

export function childNodeByName(allNodes, nodeOrId, childName) {
  const n = typeof nodeOrId === 'string' ? allNodes[nodeOrId] : nodeOrId;
  return n.children ? n.children.find(child => allNodes[child].name === childName) : null;
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

  toString() {
    return `${this.nodeId}:${this.entry}`;
  }

  hashCode() {
    return hash(this.toString());
  }

  toHref() {
    const fullPath = path.posix.join(this.nodeId, this.entry);
    return `stash:${encodeURI(fullPath)}`;
  }

  static fromHref(href) {
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
}
