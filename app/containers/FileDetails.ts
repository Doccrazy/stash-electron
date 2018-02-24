import { connect } from 'react-redux';
import FileDetails from '../components/FileDetails';
import { openCurrent } from '../actions/edit';
import { prepareDelete, selectHistory } from '../actions/currentEntry';
import {RootState} from '../actions/types';
import { commitsFor, findHistoricEntry } from '../store/selectors';
import { copyStashLink } from '../store/stashLinkHandler';
import {isAccessible} from '../utils/repository';

export default connect((state: RootState) => ({
  entry: state.currentEntry.ptr && (state.currentEntry.historyCommit
    ? findHistoricEntry(state.currentEntry.ptr, state.git.history, state.currentEntry.historyCommit).entry
    : state.currentEntry.ptr.entry),
  parsedContent: state.currentEntry.parsedContent,
  accessible: state.currentEntry.ptr && isAccessible(state.repository.nodes, state.currentEntry.ptr.nodeId, state.privateKey.username),
  history: state.currentEntry.ptr ? commitsFor(state, state.currentEntry.ptr).toArray() : [],
  selectedCommit: state.currentEntry.historyCommit
}), dispatch => ({
  onEdit: () => dispatch(openCurrent()),
  onDelete: () => dispatch(prepareDelete()),
  onCopyLink: () => dispatch((_, getState) => copyStashLink(getState().currentEntry.ptr)),
  onSelectHistory: (oid?: string) => dispatch(selectHistory(oid))
}))(FileDetails);
