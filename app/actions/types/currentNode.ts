import {SpecialFolderId} from '../../utils/specialFolders';

export interface State {
  readonly nodeId?: string,
  readonly specialId?: SpecialFolderId,
  readonly renaming?: boolean,
  readonly creating?: boolean,
  readonly deleting?: boolean,
  readonly initialName?: string,
  readonly name?: string
}
