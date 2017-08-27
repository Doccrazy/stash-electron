import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FileDetails from '../components/FileDetails';
import { EntryPtr } from '../utils/repository';

export default connect(state => ({
  node: state.currentEntry.ptr && state.repository.nodes[state.currentEntry.ptr.nodeId],
  entry: state.currentEntry.ptr && state.currentEntry.ptr.entry,
  parsedContent: state.currentEntry.parsedContent,
}), dispatch => ({
}))(FileDetails);
