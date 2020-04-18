import Node from '../../domain/Node';

export interface State {
  readonly nodes: { [nodeId: string]: Node };
  readonly name?: string;
  readonly path?: string;
  readonly loading?: boolean;
}
