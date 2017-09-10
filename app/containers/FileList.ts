import { connect } from 'react-redux';
import FileList from '../components/FileList';
import EntryPtr from '../domain/EntryPtr';
import { select } from '../actions/currentEntry';
import { open } from '../actions/edit';
import { toggle as toggleFavorite } from '../actions/favorites';
import specialFolders, {SpecialFolderId} from '../utils/specialFolders';

function entryList(state: any): EntryPtr[] {
  if (state.currentNode.specialId) {
    const selector = specialFolders[state.currentNode.specialId as SpecialFolderId].selector;
    return selector(state);
  } else if (state.currentNode.nodeId) {
    return (state.repository.nodes[state.currentNode.nodeId].entries || []).map((entry: string) => new EntryPtr(state.currentNode.nodeId, entry));
  }
  return [];
}

export default connect(state => ({
  entries: entryList(state),
  selectedEntry: state.currentEntry.ptr,
  favorites: state.favorites
}), dispatch => ({
  onSelect: (ptr: EntryPtr) => dispatch(select(ptr)),
  onEdit: (ptr: EntryPtr) => dispatch(open(ptr)),
  onToggleFavorite: (ptr: EntryPtr) => dispatch(toggleFavorite(ptr))
}))(FileList);
