import {Set, Collection, OrderedSet} from 'immutable';

/**
 * displays at most 5 items from a user list (including the ellipsis); e.g. a,b,c,d - a,b,c,d,e - a,b,c,d and 2 more
 */
export function formatUserList(title: string, users: Collection.Set<string> |  Collection.Indexed<string> | string[], currentUser?: string) {
  const names = [];
  let users2 = Set(users).sort() as OrderedSet<string>;
  if (currentUser && users2.includes(currentUser)) {
    names.push('yourself');
    users2 = users2.remove(currentUser);
  }
  while ((names.length < 4 || users2.size < 2) && users2.size) {
    names.push(users2.first());
    users2 = users2.remove(users2.first()!);
  }
  let result = title + names.join(', ');
  if (users2.size) {
    result += ` and ${users2.size} more`;
  }
  return result;
}

const DATE_TIME_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: 'numeric' };

export function formatDateTime(date: Date) {
  return date.toLocaleString(undefined, DATE_TIME_FORMAT);
}

export function formatPath(path: string[]): string {
  return path.length <= 1 ? '/' : path.slice(1).slice(-2).join('/');
}

export function formatPathSpaced(path: string[]): string {
  return path.length <= 1 ? '/' : path.slice(1).slice(-2).join(' / ');
}
