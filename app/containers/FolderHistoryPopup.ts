import { connect } from 'react-redux';
import { getRepo } from '../actions/repository';
import { Dispatch, RootState } from '../actions/types';
import { close } from '../actions/nodeHistory';
import GitCommitsPopup from '../components/GitCommitsPopup';

export default connect((state: RootState) => {
  const path = state.nodeHistory.nodeId ? getRepo().resolvePath(state.nodeHistory.nodeId) : '';
  const commits = state.nodeHistory.open ? state.git.history.commits.valueSeq().toArray()
    .filter(commit =>
      (commit.changedFiles && commit.changedFiles.find(fn => fn.startsWith(path)))
      || (commit.deletedFiles && commit.deletedFiles.find(fn => fn.startsWith(path)))) : [];
  return ({
    open: state.nodeHistory.open,
    title: state.nodeHistory.nodeId ? `Commits for ${state.repository.nodes[state.nodeHistory.nodeId].name} (${commits.length})` : undefined,
    commits
  });
}, (dispatch: Dispatch) => ({
  onClose: () => dispatch(close())
}))(GitCommitsPopup);
