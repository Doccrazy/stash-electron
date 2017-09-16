import { connect } from 'react-redux';
import FileDetails from '../components/FileDetails';
import { openCurrent } from '../actions/edit';
import { prepareDelete } from '../actions/currentEntry';
import {RootState} from '../actions/types/index';

export default connect((state: RootState) => ({
  node: state.currentEntry.ptr && state.repository.nodes[state.currentEntry.ptr.nodeId],
  entry: state.currentEntry.ptr && state.currentEntry.ptr.entry,
  parsedContent: state.currentEntry.parsedContent,
}), dispatch => ({
  onEdit: () => dispatch(openCurrent()),
  onDelete: () => dispatch(prepareDelete())
}))(FileDetails);
