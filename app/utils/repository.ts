import {List} from 'immutable';
import Node from '../domain/Node';

export function hierarchy(nodes: { [nodeId: string]: Node }, nodeId: string): Node[] {
  const result = [];
  if (nodeId) {
    let n: Node | null = nodes[nodeId];
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

export function cleanFileName(fn: string, replacement: string = '') {
  return fn ? fn.replace(/[/\\:*?"<>|]/g, replacement) : fn;
}

export function hasChildOrEntry(allNodes: { [nodeId: string]: Node }, node: Node, nameToCheck: string) {
  return (node.entries && node.entries.find(e => e === nameToCheck))
    || !!childNodeByName(allNodes, node, nameToCheck);
}

export function childNodeByName(allNodes: { [nodeId: string]: Node }, nodeOrId: Node | string, childName: string) {
  const n = typeof nodeOrId === 'string' ? allNodes[nodeOrId] : nodeOrId;
  return n.childIds ? n.childIds.find(child => !!child && allNodes[child].name === childName) : null;
}

export async function readNodeRecursive(nodeReader: (nodeId: string) => Promise<Node>, nodeId: string): Promise<List<Node>> {
  console.time('readNodeRecursive');
  (process as any).noAsar = true;

  let result: Node[] = [];
  let readQueue = [nodeId];

  while (readQueue.length) {
    const readNodes = await Promise.all(readQueue.map(n => nodeReader(n)));
    result = result.concat(readNodes);
    readQueue = readNodes.reduce((acc: string[], n: Node) => acc.concat(n.childIds.toArray()), []);
  }

  (process as any).noAsar = false;

  console.timeEnd('readNodeRecursive');
  console.log(result.length);
  return List(result);
}
