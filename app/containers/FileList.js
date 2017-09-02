import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FileList from '../components/FileList';
import { EntryPtr } from '../utils/repository';
import { select } from '../actions/currentEntry';
import { open } from '../actions/edit';
import { toggle as toggleFavorite } from '../actions/favorites';

export default connect(state => ({
  currentNode: state.repository.nodes[state.currentNode.nodeId],
  selectedEntry: state.currentEntry.ptr && state.currentEntry.ptr.nodeId === state.currentNode.nodeId && state.currentEntry.ptr.entry,
  favorites: state.favorites.filter(ptr => ptr.nodeId === state.currentNode.nodeId).map(ptr => ptr.entry)
}), dispatch => ({
  onSelect: (node, entry) => dispatch(select(new EntryPtr(node, entry))),
  onEdit: (node, entry) => dispatch(open(new EntryPtr(node, entry))),
  onToggleFavorite: (node, entry) => dispatch(toggleFavorite(new EntryPtr(node, entry)))
}))(FileList);
