import { connect } from 'react-redux';
import {RootState} from '../actions/types/index';
import UserKeyAddPopup from '../components/UserKeyAddPopup';
import {change, closeAdd, confirmAdd, browseLoadKey} from '../actions/keys';
import {FormState} from '../actions/types/keys';

export default connect((state: RootState) => ({
  open: state.keys.addOpen,
  feedback: state.keys.feedback,
  valid: state.keys.valid,
  value: state.keys.formState
}), dispatch => ({
  onChange: (value: FormState) => dispatch(change(value)),
  onLoadKey: () => dispatch(browseLoadKey()),
  onConfirm: () => dispatch(confirmAdd()),
  onClose: () => dispatch(closeAdd())
}))(UserKeyAddPopup);
