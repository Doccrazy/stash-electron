import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EditPopup from '../components/EditPopup';
import { EntryPtr } from '../utils/repository';
import { change, changeState, save, close } from '../actions/edit';

export default connect(state => ({
  entry: state.edit.ptr && state.edit.ptr.entry,
  parsedContent: state.edit.parsedContent,
  formState: state.edit.formState || {},
  validationError: state.edit.validationError
}), dispatch => ({
  onChange: value => dispatch(change(value)),
  onChangeState: value => dispatch(changeState(value)),
  onSave: () => dispatch(save(true)),
  onClose: () => dispatch(close())
}))(EditPopup);
