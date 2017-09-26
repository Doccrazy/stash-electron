import { connect } from 'react-redux';
import {Set} from 'immutable';
import AuthorizedUsersPopup from '../components/AuthorizedUsersPopup';
import { save, close, change, toggleInherit } from '../actions/authorizedUsers';
import {RootState} from '../actions/types/index';
import {findAuthParent, isAccessible} from '../utils/repository';

export default connect((state: RootState) => {
  const authParent = state.authorizedUsers.nodeId && findAuthParent(state.repository.nodes, state.authorizedUsers.nodeId);
  return ({
    open: !!state.authorizedUsers.nodeId,
    nodeName: state.authorizedUsers.nodeId && state.repository.nodes[state.authorizedUsers.nodeId].name,
    inherited: state.authorizedUsers.inherited,
    editable: !!state.authorizedUsers.nodeId && isAccessible(state.repository.nodes, state.authorizedUsers.nodeId, state.privateKey.username),
    modified: state.authorizedUsers.inherited !== state.authorizedUsers.initialInherited
      || (state.authorizedUsers.users && state.authorizedUsers.initialUsers && !state.authorizedUsers.users.equals(state.authorizedUsers.initialUsers)),
    currentUser: state.privateKey.username,
    users: state.authorizedUsers.users,
    allUsers: Set(Object.keys(state.keys.byUser)),
    authParent: authParent && authParent.id !== state.authorizedUsers.nodeId ? authParent : undefined,
    validationError: ''
  });
}, dispatch => ({
  onChange: (users: Set<string>) => dispatch(change(users)),
  onToggleInherit: () => dispatch(toggleInherit()),
  onSave: () => dispatch(save()),
  onClose: () => dispatch(close())
}))(AuthorizedUsersPopup);
