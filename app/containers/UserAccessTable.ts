import { connect } from 'react-redux';
import { deleteUser } from '../actions/keys';
import { RootState } from '../actions/types';
import UserAccessTable from '../components/UserAccessTable';
import { findUser } from '../repository/KeyProvider';

export default connect((state: RootState, props: void) => ({
  users: Object.keys(state.keys.edited),
  authorizationNodes: Object.values(state.repository.nodes).filter(n => n.authorizedUsers && n.authorizedUsers.size),
  currentUser: state.privateKey.key ? findUser(state.keys.edited, state.privateKey.key) : null
}), (dispatch, props) => ({
  onDelete: (username: string) => dispatch(deleteUser(username))
}))(UserAccessTable);
