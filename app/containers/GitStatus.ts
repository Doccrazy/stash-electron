import { connect } from 'react-redux';
import { resolveConflict, updateStatus } from '../actions/git';
import {RootState} from '../actions/types/index';
import GitStatus from '../components/GitStatus';

export default connect((state: RootState, props: void) => ({
  initialized: state.git.status.initialized,
  error: !!state.git.status.error,
  conflict: state.git.status.conflict,
  working: state.git.working,
  ahead: state.git.status.commitsAheadOrigin
}), (dispatch, props) => ({
  onRefresh: () => dispatch(updateStatus(true)),
  onResolve: () => dispatch(resolveConflict())
}))(GitStatus);
