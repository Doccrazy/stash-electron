import { List, Set } from 'immutable';
import Node from '../domain/Node';

export function hierarchy(nodes: { [nodeId: string]: Node }, nodeOrId?: Node | string): Node[] {
  const result = [];
  if (nodeOrId) {
    let n: Node | null = typeof nodeOrId === 'string' ? nodes[nodeOrId] : nodeOrId;
    while (n) {
      result.unshift(n);
      n = n.parentId ? nodes[n.parentId] : null;
    }
  }
  return result;
}

export function recursiveChildIds(nodes: { [nodeId: string]: Node }, parentId: string) {
  const result = [parentId];
  pushChildren(result, nodes, parentId);
  return result;
}

function pushChildren(result: string[], nodes: { [nodeId: string]: Node }, parentId: string) {
  const items = nodes[parentId].childIds.toArray();
  result.push(...items);
  for (const cid of items) {
    pushChildren(result, nodes, cid);
  }
}

export function isValidFileName(fn?: string): fn is string {
  return !!fn && !/[/\\:*?"<>|]/.test(fn);
}

export function cleanFileName(fn: string, replacement = '') {
  return fn ? fn.replace(/[/\\:*?"<>|]/g, replacement) : fn;
}

export function hasChildOrEntry(allNodes: { [nodeId: string]: Node }, node: Node, nameToCheck: string): boolean {
  return !!node.entryByName(nameToCheck) || !!childNodeByName(allNodes, node, nameToCheck);
}

export function childNodeByName(allNodes: { [nodeId: string]: Node }, nodeOrId: Node | string, childName: string) {
  const n = typeof nodeOrId === 'string' ? allNodes[nodeOrId] : nodeOrId;
  return n.childIds.find((child: string) => allNodes[child] && allNodes[child].name.toLowerCase() === childName.toLowerCase());
}

export function isParentOrSelf(nodes: { [id: string]: Node }, parentId: string, childId: string) {
  let child = nodes[childId];
  while (child.id !== parentId && child.parentId) {
    child = nodes[child.parentId];
  }
  return child.id === parentId;
}

export async function readNodeRecursive(
  nodeReader: (nodeId: string) => Promise<Node>,
  nodeId: string,
  filter?: (node: Node) => boolean
): Promise<List<Node>> {
  console.time('readNodeRecursive');
  // (process as any).noAsar = true;

  let result: Node[] = [];
  let readQueue = [nodeId];

  while (readQueue.length) {
    let readNodes = await Promise.all(readQueue.map((n) => nodeReader(n)));
    if (filter) {
      readNodes = readNodes.filter(filter);
    }
    result = result.concat(readNodes);
    readQueue = readNodes.reduce((acc: string[], n: Node) => acc.concat(n.childIds.toArray()), []);
  }

  // (process as any).noAsar = false;

  console.timeEnd('readNodeRecursive');
  console.log(result.length);
  return List(result);
}

export function findAuthParent(nodes: { [id: string]: Node }, nodeId: string) {
  let result = nodes[nodeId];
  while (!result.authorizedUsers && result.parentId) {
    result = nodes[result.parentId];
  }
  return result.authorizedUsers ? result : undefined;
}

export function isAccessible(nodes: { [id: string]: Node }, nodeId: string, username?: string) {
  if (!nodes[nodeId]) {
    return false;
  }
  const authParent = findAuthParent(nodes, nodeId);
  if (!authParent) {
    return false;
  }
  return isAuth(authParent, username);
}

export function isFullyAccessible(nodes: { [id: string]: Node }, nodeId: string, username?: string) {
  if (!isAccessible(nodes, nodeId, username)) {
    return false;
  }
  return !recursiveChildIds(nodes, nodeId).find((childId) => nodes[childId] && !isAuth(nodes[childId], username));
}

export function isAnyAccessible(nodes: { [id: string]: Node }, nodeId: string, username?: string) {
  if (isAccessible(nodes, nodeId, username)) {
    return true;
  }
  return !!recursiveChildIds(nodes, nodeId).find((childId) => nodes[childId] && isDirectAuth(nodes[childId], username));
}

function isAuth(node: Node, username?: string) {
  return !node.authorizedUsers || (!!username && node.authorizedUsers.includes(username));
}

function isDirectAuth(node: Node, username?: string) {
  return !!username && !!node.authorizedUsers && node.authorizedUsers.includes(username);
}

// these files are used for user-local settings and should not be shared
export const RES_LOCAL_FILENAMES = Set<string>(['.favorites.json']);
// these files are used internally and should not be allowed for file or folder names
export const RESERVED_FILENAMES = Set<string>(['.git', '.gitignore', '.keys.json', '.users.json']).union(RES_LOCAL_FILENAMES);
