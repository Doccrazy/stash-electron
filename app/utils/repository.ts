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
  let result = [parentId];
  const children = nodes[parentId].childIds || [];
  children.forEach(childId => {
    if (childId) {
      result = result.concat(recursiveChildIds(nodes, childId));
    }
  });
  return result;
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
