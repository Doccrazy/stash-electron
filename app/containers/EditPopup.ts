import { connect } from 'react-redux';
import EditPopup from '../components/EditPopup';
import { change, changeState, changeName, save, close } from '../actions/edit';
import { Dispatch, RootState } from '../actions/types/index';
import { formatUserList } from '../utils/format';
import { findAuthParent } from '../utils/repository';

export default connect(
  (state: RootState) => {
    const authParent = state.edit.ptr && findAuthParent(state.repository.nodes, state.edit.ptr.nodeId);
    return {
      open: !!state.edit.ptr,
      isNew: state.edit.ptr && !state.edit.ptr.entry,
      typeId: state.edit.typeId,
      name: state.edit.name,
      parsedContent: state.edit.parsedContent,
      formState: state.edit.formState || {},
      validationError: state.edit.validationError,
      authInfo:
        authParent && authParent.authorizedUsers
          ? formatUserList('common.accessibleTo', authParent.authorizedUsers, state.privateKey.username)
          : undefined
    };
  },
  (dispatch: Dispatch) => ({
    onChangeName: (value: string) => dispatch(changeName(value)),
    onChange: (value: any) => dispatch(change(value)),
    onChangeState: (value: any) => dispatch(changeState(value)),
    onSave: () => dispatch(save(true)),
    onClose: () => dispatch(close())
  })
)(EditPopup);
