import { connect } from 'react-redux';
import { openPopup } from '../actions/git';
import {RootState} from '../actions/types/index';
import GitStatus from '../components/GitStatus';

export default connect((state: RootState, props: void) => ({
  initialized: state.git.status.initialized,
  error: !!state.git.status.error,
  conflict: state.git.status.conflict,
  working: state.git.working,
  ahead: state.git.status.commitsAheadOrigin,
  incoming: state.git.status.incomingCommits
}), (dispatch, props) => ({
  onClick: () => dispatch(openPopup())
}))(GitStatus);
