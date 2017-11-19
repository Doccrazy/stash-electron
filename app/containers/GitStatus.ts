import { connect } from 'react-redux';
import { openPopup } from '../actions/git';
import {RootState} from '../actions/types/index';
import GitStatus from '../components/GitStatus';

export default connect((state: RootState, props: void) => ({
  status: state.git.status,
  working: state.git.working
}), (dispatch, props) => ({
  onClick: () => dispatch(openPopup())
}))(GitStatus);
