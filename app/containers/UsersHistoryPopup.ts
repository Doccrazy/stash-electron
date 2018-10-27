import { connect } from 'react-redux';
import { Dispatch, RootState } from '../actions/types';
import { close } from '../actions/usersHistory';
import UsersHistoryPopup from '../components/UsersHistoryPopup';
import { commitsFor } from '../store/selectors';

export default connect((state: RootState) => {
  return ({
    open: state.usersHistory.usersOpen,
    history: commitsFor(state, '.keys.json').toArray()
  });
}, (dispatch: Dispatch) => ({
  onClose: () => dispatch(close())
}))(UsersHistoryPopup);
