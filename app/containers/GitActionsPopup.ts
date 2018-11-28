import { connect } from 'react-redux';
import { markForReset, closePopup, updateStatus, resolveConflict, revertAndPush, popupShowAll } from '../actions/git';
import { Dispatch, RootState } from '../actions/types/index';
import GitActionsPopup from '../components/GitActionsPopup';

export default connect((state: RootState) => ({
  open: state.git.popupOpen,
  disabled: state.git.working,
  status: { ...state.git.status, commits: state.git.popupShowAll ? state.git.history.commits.valueSeq().toArray() : state.git.status.commits },
  markedForReset: state.git.markedForReset,
  allowShowAll: !state.git.popupShowAll
}), (dispatch: Dispatch) => ({
  onMarkReset: (commitHash?: string) => dispatch(markForReset(commitHash)),
  onPushRevert: () => dispatch(revertAndPush()),
  onRefresh: () => dispatch(updateStatus(true)),
  onResolve: () => dispatch(resolveConflict()),
  onClose: () => dispatch(closePopup()),
  onShowAll: () => dispatch(popupShowAll())
}))(GitActionsPopup);
