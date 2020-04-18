import { connect } from 'react-redux';
import { Set } from 'immutable';
import { openAuth } from '../actions/usersHistory';
import AuthorizedUsersPopup from '../components/AuthorizedUsersPopup';
import { save, close, change, toggleInherit } from '../actions/authorizedUsers';
import { Dispatch, RootState } from '../actions/types/index';
import { findAuthParent, isAccessible } from '../utils/repository';

export default connect(
  (state: RootState) => {
    const node = state.authorizedUsers.nodeId ? state.repository.nodes[state.authorizedUsers.nodeId] : undefined;
    const parentNodeId = !!node && node.parentId;
    const authParent = parentNodeId ? findAuthParent(state.repository.nodes, parentNodeId) : undefined;
    return {
      open: !!node,
      nodeName: node && node.name,
      inherited: state.authorizedUsers.inherited,
      editable:
        !!node &&
        (isAccessible(state.repository.nodes, node.id, state.privateKey.username) || (node.childIds.isEmpty() && node.entries.isEmpty())),
      modified:
        state.authorizedUsers.inherited !== state.authorizedUsers.initialInherited ||
        (state.authorizedUsers.users &&
          state.authorizedUsers.initialUsers &&
          !state.authorizedUsers.users.equals(state.authorizedUsers.initialUsers)),
      currentUser: state.privateKey.username,
      users: state.authorizedUsers.users,
      allUsers: Set(Object.keys(state.keys.byUser)),
      authParent
    };
  },
  (dispatch: Dispatch) => ({
    onChange: (users: Set<string>) => dispatch(change(users)),
    onToggleInherit: () => dispatch(toggleInherit()),
    onSave: () => dispatch(save()),
    onHistory: () =>
      dispatch((_, getState) => {
        dispatch(openAuth(getState().authorizedUsers.nodeId));
      }),
    onClose: () => dispatch(close())
  })
)(AuthorizedUsersPopup);
