import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FileDetails from '../components/FileDetails';
import { EntryPtr } from '../utils/repository';
import { openCurrent, deleteCurrent } from '../actions/edit';

export default connect(state => ({
  node: state.currentEntry.ptr && state.repository.nodes[state.currentEntry.ptr.nodeId],
  entry: state.currentEntry.ptr && state.currentEntry.ptr.entry,
  parsedContent: state.currentEntry.parsedContent,
}), dispatch => ({
  onEdit: () => dispatch(openCurrent()),
  onDelete: () => dispatch(deleteCurrent())
}))(FileDetails);
