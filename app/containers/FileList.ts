import { connect } from 'react-redux';
import naturalCompare from 'natural-compare';
import FileList from '../components/FileList';
import EntryPtr from '../domain/EntryPtr';
import { select } from '../actions/currentEntry';
import { open } from '../actions/edit';
import { toggle as toggleFavorite } from '../actions/favorites';
import specialFolders, {SpecialFolderId} from '../utils/specialFolders';
import {RootState} from '../actions/types/index';
import FileListEntry from '../domain/FileListEntry';
import {hierarchy, isAccessible} from '../utils/repository';
import {hashString} from '../utils/hash';
import {Set} from 'immutable';

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
  return result.map(ptr => new FileListEntry(ptr,
    hierarchy(state.repository.nodes, ptr.nodeId).map(node => node.name), new Date(1505249965000 - (hashString(ptr.entry) >>> 0) * 5),
    accessibleByNode[ptr.nodeId]));
}

export default connect((state: RootState) => ({
  files: createFileList(state),
  selectedEntry: state.currentEntry.ptr,
  favorites: state.favorites,
  showPath: !!state.currentNode.specialId
}), dispatch => ({
  onSelect: (ptr: EntryPtr) => dispatch(select(ptr)),
  onEdit: (ptr: EntryPtr) => dispatch(open(ptr)),
  onToggleFavorite: (ptr: EntryPtr) => dispatch(toggleFavorite(ptr))
}))(FileList);
