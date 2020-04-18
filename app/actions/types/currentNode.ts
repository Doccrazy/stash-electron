import { SpecialFolderId } from '../../utils/specialFolders';

export interface MoveState {
  nodeId: string;
  targetNodeId: string;
}

export interface State {
  readonly nodeId?: string;
  readonly specialId?: SpecialFolderId;
  readonly renaming?: boolean;
  readonly creating?: boolean;
  readonly deleting?: string;
  readonly initialName?: string;
  readonly name?: string;
  readonly move?: MoveState;
}
