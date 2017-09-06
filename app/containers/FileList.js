import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FileList from '../components/FileList';
import { EntryPtr } from '../utils/repository';
import { select } from '../actions/currentEntry';
import { open } from '../actions/edit';
import { toggle as toggleFavorite } from '../actions/favorites';
import specialFolders from '../utils/specialFolders';

function entryList(state) {
  if (state.currentNode.specialId) {
    const selector = specialFolders[state.currentNode.specialId].selector;
    return selector(state);
  } else if (state.currentNode.nodeId) {
    return (state.repository.nodes[state.currentNode.nodeId].entries || []).map(entry => new EntryPtr(state.currentNode.nodeId, entry));
  }
  return [];
}

export default connect(state => ({
  entries: entryList(state),
  selectedEntry: state.currentEntry.ptr,
  favorites: state.favorites
}), dispatch => ({
  onSelect: ptr => dispatch(select(ptr)),
  onEdit: ptr => dispatch(open(ptr)),
  onToggleFavorite: ptr => dispatch(toggleFavorite(ptr))
}))(FileList);
