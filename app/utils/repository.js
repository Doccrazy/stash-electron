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
