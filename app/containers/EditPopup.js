import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import EditPopup from '../components/EditPopup';
import { EntryPtr } from '../utils/repository';
import { change, changeState, changeName, save, close } from '../actions/edit';

export default connect(state => ({
  open: !!state.edit.ptr,
  isNew: state.edit.ptr && !state.edit.ptr.entry,
  typeId: state.edit.typeId,
  name: state.edit.name,
  parsedContent: state.edit.parsedContent,
  formState: state.edit.formState || {},
  validationError: state.edit.validationError
}), dispatch => ({
  onChangeName: value => dispatch(changeName(value)),
  onChange: value => dispatch(change(value)),
  onChangeState: value => dispatch(changeState(value)),
  onSave: () => dispatch(save(true)),
  onClose: () => dispatch(close())
}))(EditPopup);
