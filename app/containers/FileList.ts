import * as fs from 'fs';
import { Set } from 'immutable';
import * as naturalCompare from 'natural-compare';
import * as path from 'path';
import { connect } from 'react-redux';
import { prepareDelete, select } from '../actions/currentEntry';
import { select as selectNode } from '../actions/currentNode';
import { open } from '../actions/edit';
import { toggleAndSave as toggleFavorite } from '../actions/favorites';
import { RootState } from '../actions/types/index';
import FileList from '../components/FileList';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import { hierarchy, isAccessible } from '../utils/repository';
import specialFolders, { SpecialFolderId } from '../utils/specialFolders';

// TODO
function lastModifiedFromFsHack(repoPath: string, ptr: EntryPtr) {
  try {
    return fs.statSync(path.join(repoPath, ptr.nodeId, `${ptr.entry}.enc`)).mtime;
  } catch (e) {
    return undefined;
  }
}

function createFileList(state: RootState): FileListEntry[] {
  let result: EntryPtr[] = [];
  if (state.currentNode.specialId) {
    const selector = specialFolders[state.currentNode.specialId as SpecialFolderId].selector;
    result = selector(state);
  } else if (state.currentNode.nodeId && state.repository.nodes[state.currentNode.nodeId]) {
    result = state.repository.nodes[state.currentNode.nodeId].entries
      .map((entry: string) => new EntryPtr(state.currentNode.nodeId as string, entry))
      .toArray();
  }
  result.sort((a, b) => naturalCompare(a.entry.toLowerCase(), b.entry.toLowerCase()));

  const accessibleByNode: { [nodeId: string]: boolean } = Set(result.map(ptr => ptr.nodeId))
    .reduce((acc, id: string) => ({ ...acc, [id]: isAccessible(state.repository.nodes, id, state.privateKey.username)}), {});
  const fileListEntries = result.map(ptr => new FileListEntry(ptr,
    hierarchy(state.repository.nodes, ptr.nodeId), lastModifiedFromFsHack(state.repository.path!, ptr),
    accessibleByNode[ptr.nodeId]));
  return state.settings.current.hideInaccessible ? fileListEntries.filter(e => e.accessible) : fileListEntries;
}

export default connect((state: RootState) => ({
  files: createFileList(state),
  selectedEntry: state.currentEntry.ptr,
  favorites: state.favorites,
  showPath: !!state.currentNode.specialId
}), dispatch => ({
  onSelect: (ptr: EntryPtr) => dispatch(select(ptr)),
  onEdit: (ptr: EntryPtr) => dispatch(open(ptr)),
  onDelete: (ptr: EntryPtr) => dispatch(prepareDelete(ptr)),
  onToggleFavorite: (ptr: EntryPtr) => dispatch(toggleFavorite(ptr)),
  onSelectNode: (nodeId: string) => dispatch(selectNode(nodeId))
}))(FileList);
