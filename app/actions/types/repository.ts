import Node from '../../domain/Node';

export interface State {
  nodes: { [nodeId: string]: Node },
  name?: string,
  path?: string,
  loading?: boolean
}
