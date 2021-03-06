import { connect } from 'react-redux';
import { close, confirm, change } from '../actions/credentials';
import { FormState } from '../actions/types/credentials';
import { Dispatch, RootState } from '../actions/types/index';
import LoginPopup from '../components/LoginPopup';

export default connect(
  (state: RootState) => ({
    open: state.credentials.open,
    working: state.credentials.working,
    askUsername: state.credentials.askUsername,
    title: state.credentials.title,
    text: state.credentials.text,
    value: state.credentials.state,
    error: state.credentials.error
  }),
  (dispatch: Dispatch) => ({
    onConfirm: () => dispatch(confirm()),
    onClose: () => dispatch(close()),
    onChange: (value: FormState) => dispatch(change(value))
  })
)(LoginPopup);
