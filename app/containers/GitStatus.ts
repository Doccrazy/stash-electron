import { connect } from 'react-redux';
import { openPopup } from '../actions/git';
import { Dispatch, RootState } from '../actions/types/index';
import GitStatus from '../components/GitStatus';

export default connect(
  (state: RootState, props: {}) => ({
    status: state.git.status,
    working: state.git.working
  }),
  (dispatch: Dispatch, props) => ({
    onClick: () => dispatch(openPopup())
  })
)(GitStatus);
