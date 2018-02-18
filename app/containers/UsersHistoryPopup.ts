import { List } from 'immutable';
import { connect } from 'react-redux';
import {RootState} from '../actions/types';
import { close } from '../actions/usersHistory';
import UsersHistoryPopup from '../components/UsersHistoryPopup';

export default connect((state: RootState) => {
  return ({
    open: state.usersHistory.usersOpen,
    history: state.git.history.files.get('.keys.json', List<string>())
      .map(oid => state.git.history.commits.get(oid)!)
      .toArray()
  });
}, dispatch => ({
  onClose: () => dispatch(close())
}))(UsersHistoryPopup);
