import { connect } from 'react-redux';
import {RootState} from '../actions/types/index';
import UserKeyAddPopup from '../components/UserKeyAddPopup';
import {change, closeAdd, confirmAdd, browseLoadKey, loadPrivateKey} from '../actions/keys';
import {FormState} from '../actions/types/keys';

export default connect((state: RootState) => ({
  open: state.keys.addOpen,
  feedback: state.keys.feedback,
  valid: state.keys.valid,
  privateKeyLoaded: !!state.privateKey.key,
  value: state.keys.formState
}), dispatch => ({
  onChange: (value: FormState) => dispatch(change(value)),
  onUsePrivateKey: () => dispatch(loadPrivateKey()),
  onLoadKey: () => dispatch(browseLoadKey()),
  onConfirm: () => dispatch(confirmAdd()),
  onClose: () => dispatch(closeAdd())
}))(UserKeyAddPopup);
