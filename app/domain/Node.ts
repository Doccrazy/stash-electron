import { Set, Iterable } from 'immutable';

export interface NodeLike {
  id: string,
  name: string,
  parentId?: string,
  childIds?: Iterable.Set<string> | Iterable.Indexed<string> | string[],
  entries?: Iterable.Set<string> | Iterable.Indexed<string> | string[]
}

export const ROOT_ID = '/';

export default class Node implements NodeLike {
  readonly id: string;
  readonly name: string;
  readonly parentId?: string;
  readonly childIds: Set<string> = Set();
  readonly entries: Set<string> = Set();

  constructor({ id, name, parentId, childIds, entries}: NodeLike) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    if (childIds) {
      this.childIds = Set(childIds);
    }
    if (entries) {
      this.entries = Set(entries);
    }
  }

  isRoot() {
    return this.id === ROOT_ID;
  }

  withEntryRenamed(oldName: string, newName: string): Node {
    const newEntries = this.entries.remove(oldName).add(newName);
    return new Node({ ...(this as NodeLike), entries: newEntries });
  }

  withEntryDeleted(entry: string): Node {
    const newEntries = this.entries.remove(entry);
    return new Node({ ...(this as NodeLike), entries: newEntries });
  }

  withNewEntry(entry: string): Node {
    const newEntries = this.entries.add(entry);
    return new Node({ ...(this as NodeLike), entries: newEntries });
  }

  withChildDeleted(childId: string): Node {
    const newChildIds = this.childIds.remove(childId);
    return new Node({ ...(this as NodeLike), childIds: newChildIds });
  }

  withNewChild(childId: string): Node {
    const newChildIds = this.childIds.add(childId);
    return new Node({ ...(this as NodeLike), childIds: newChildIds });
  }
}
