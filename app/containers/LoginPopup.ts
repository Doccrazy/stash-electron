import { connect } from 'react-redux';
import { close, confirm, change } from '../actions/login';
import {FormState} from '../actions/types/login';
import {RootState} from '../actions/types/index';
import LoginPopup from '../components/LoginPopup';

export default connect((state: RootState) => ({
  open: state.login.open,
  askUsername: state.login.askUsername,
  title: state.login.title,
  text: state.login.text,
  value: state.login.state,
  error: state.login.error
}), dispatch => ({
  onConfirm: () => dispatch(confirm()),
  onClose: () => dispatch(close()),
  onChange: (value: FormState) => dispatch(change(value))
}))(LoginPopup);
