import { connect } from 'react-redux';
import { bulkReset, bulkSave } from '../actions/authorizedUsers';
import {openAdd, reload, save} from '../actions/keys';
import { Dispatch, RootState, Thunk } from '../actions/types';
import UserKeyActionBar from '../components/UserKeyActionBar';

function m(keysAction: () => any, bulkAction: () => any): Thunk<void> {
  return (dispatch, getState) => {
    if (getState().keys.modified) {
      dispatch(keysAction());
    }
    if (!getState().authorizedUsers.bulkChanges.isEmpty()) {
      dispatch(bulkAction());
    }
  };
}

export default connect((state: RootState, props: {}) => ({
  modified: state.keys.modified || !state.authorizedUsers.bulkChanges.isEmpty()
}), (dispatch: Dispatch, props) => ({
  onAdd: () => dispatch(openAdd()),
  onSave: () => dispatch(m(save, bulkSave)),
  onUndo: () => dispatch(m(reload, bulkReset))
}))(UserKeyActionBar);
