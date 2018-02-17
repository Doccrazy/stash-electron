import { Set, Collection } from 'immutable';

export interface NodeLike {
  id: string,
  name: string,
  parentId?: string,
  childIds?: Collection.Set<string> | Collection.Indexed<string> | string[],
  entries?: Collection.Set<string> | Collection.Indexed<string> | string[],
  authorizedUsers?: Collection.Set<string> | Collection.Indexed<string> | string[]
}

export const ROOT_ID = '/';

export default class Node implements NodeLike {
  readonly id: string;
  readonly name: string;
  readonly parentId?: string;
  readonly childIds: Set<string> = Set();
  readonly entries: Set<string> = Set();
  readonly authorizedUsers?: Set<string>;

  constructor({ id, name, parentId, childIds, entries, authorizedUsers}: NodeLike) {
    this.id = id;
    this.name = name;
    this.parentId = parentId;
    if (childIds) {
      this.childIds = Set(childIds);
    }
    if (entries) {
      this.entries = Set(entries);
    }
    if (authorizedUsers) {
      this.authorizedUsers = Set(authorizedUsers);
    }
  }

  isRoot() {
    return this.id === ROOT_ID;
  }

  /**
   * Case-insensitive search
   */
  entryByName(entry: string): string | undefined {
    return entry ? this.entries.find((e: string) => e.toLowerCase() === entry.toLowerCase()) : undefined;
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
