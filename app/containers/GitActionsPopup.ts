import { connect } from 'react-redux';
import { markForReset, closePopup, updateStatus, resolveConflict, revertAndPush } from '../actions/git';
import { Dispatch, RootState } from '../actions/types/index';
import GitActionsPopup from '../components/GitActionsPopup';

export default connect((state: RootState) => ({
  open: state.git.popupOpen,
  disabled: state.git.working,
  status: state.git.status,
  markedForReset: state.git.markedForReset
}), (dispatch: Dispatch) => ({
  onMarkReset: (commitHash?: string) => dispatch(markForReset(commitHash)),
  onPushRevert: () => dispatch(revertAndPush()),
  onRefresh: () => dispatch(updateStatus(true)),
  onResolve: () => dispatch(resolveConflict()),
  onClose: () => dispatch(closePopup())
}))(GitActionsPopup);
