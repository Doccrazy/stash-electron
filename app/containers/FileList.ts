import { connect } from 'react-redux';
import naturalCompare from 'natural-compare';
import FileList from '../components/FileList';
import EntryPtr from '../domain/EntryPtr';
import { select } from '../actions/currentEntry';
import { open } from '../actions/edit';
import { toggle as toggleFavorite } from '../actions/favorites';
import specialFolders, {SpecialFolderId} from '../utils/specialFolders';
import {RootState} from '../actions/types/index';

function entryList(state: RootState): EntryPtr[] {
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
  return result;
}

export default connect((state: RootState) => ({
  entries: entryList(state),
  selectedEntry: state.currentEntry.ptr,
  favorites: state.favorites
}), dispatch => ({
  onSelect: (ptr: EntryPtr) => dispatch(select(ptr)),
  onEdit: (ptr: EntryPtr) => dispatch(open(ptr)),
  onToggleFavorite: (ptr: EntryPtr) => dispatch(toggleFavorite(ptr))
}))(FileList);
