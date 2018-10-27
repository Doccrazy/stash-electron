import { Set } from 'immutable';
import { connect } from 'react-redux';
import { entryContextMenu } from '../actions/contextMenus';
import { prepareDelete, select } from '../actions/currentEntry';
import { select as selectNode } from '../actions/currentNode';
import { open } from '../actions/edit';
import { toggleAndSave as toggleFavorite } from '../actions/favorites';
import { Dispatch, RootState } from '../actions/types/index';
import FileList from '../components/FileList';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import {sortedFileList} from '../store/selectors';
import { hierarchy, isAccessible } from '../utils/repository';

function createFileList(state: RootState): FileListEntry[] {
  const fileList = sortedFileList(state);

  const accessibleByNode: { [nodeId: string]: boolean } = Set(fileList.map(ptr => ptr.nodeId))
    .reduce((acc, id: string) => ({ ...acc, [id]: isAccessible(state.repository.nodes, id, state.privateKey.username)}), {});
  const fileListEntries = fileList.map(ptr => new FileListEntry(ptr,
    hierarchy(state.repository.nodes, ptr.nodeId), state.entryDetails.get(ptr),
    accessibleByNode[ptr.nodeId]));
  return state.settings.current.hideInaccessible ? fileListEntries.filter(e => e.accessible) : fileListEntries;
}

export default connect((state: RootState) => ({
  files: createFileList(state),
  selectedEntry: state.currentEntry.ptr,
  favorites: state.favorites,
  showPath: !!state.currentNode.specialId
}), (dispatch: Dispatch) => ({
  onSelect: (ptr: EntryPtr) => dispatch(select(ptr)),
  onEdit: (ptr: EntryPtr) => dispatch(open(ptr)),
  onDelete: (ptr: EntryPtr) => dispatch(prepareDelete(ptr)),
  onToggleFavorite: (ptr: EntryPtr) => dispatch(toggleFavorite(ptr)),
  onSelectNode: (nodeId: string) => dispatch(selectNode(nodeId)),
  onContextMenu: (ptr: EntryPtr) => dispatch(entryContextMenu(ptr))
}))(FileList);
