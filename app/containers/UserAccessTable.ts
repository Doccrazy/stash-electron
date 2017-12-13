import { connect } from 'react-redux';
import { bulkToggle } from '../actions/authorizedUsers';
import { RootState } from '../actions/types';
import UserAccessTable from '../components/UserAccessTable';
import Node from '../domain/Node';
import { findUser } from '../repository/KeyProvider';

export default connect((state: RootState, props: void) => ({
  users: Object.keys(state.keys.edited),
  authorizationNodes: Object.values(state.repository.nodes).filter(n => n.authorizedUsers && n.authorizedUsers.size),
  currentUser: state.privateKey.key ? findUser(state.keys.edited, state.privateKey.key) : null,
  modifications: state.authorizedUsers.bulkChanges
}), (dispatch, props) => ({
  onToggle: (node: Node, username: string) => { dispatch(bulkToggle({ nodeId: node.id, username })); }
}))(UserAccessTable);
