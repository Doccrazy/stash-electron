import { connect } from 'react-redux';
import EditPopup from '../components/EditPopup';
import { change, changeState, changeName, save, close } from '../actions/edit';
import {RootState} from '../actions/types/index';

export default connect((state: RootState) => ({
  open: !!state.edit.ptr,
  isNew: state.edit.ptr && !state.edit.ptr.entry,
  typeId: state.edit.typeId,
  name: state.edit.name,
  parsedContent: state.edit.parsedContent,
  formState: state.edit.formState || {},
  validationError: state.edit.validationError
}), dispatch => ({
  onChangeName: (value: string) => dispatch(changeName(value)),
  onChange: (value: any) => dispatch(change(value)),
  onChangeState: (value: any) => dispatch(changeState(value)),
  onSave: () => dispatch(save(true)),
  onClose: () => dispatch(close())
}))(EditPopup);
