import { connect } from 'react-redux';
import {RootState} from '../actions/types';
import { close } from '../actions/usersHistory';
import UsersHistoryPopup from '../components/UsersHistoryPopup';
import { commitsFor } from '../store/selectors';

export default connect((state: RootState) => {
  return ({
    open: state.usersHistory.usersOpen,
    history: commitsFor(state, '.keys.json').toArray()
  });
}, dispatch => ({
  onClose: () => dispatch(close())
}))(UsersHistoryPopup);
