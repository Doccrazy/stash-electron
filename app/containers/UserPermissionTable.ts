import { connect } from 'react-redux';
import { deleteUser } from '../actions/keys';
import {RootState} from '../actions/types';
import UserPermissionTable, { PermissionMap } from '../components/UserPermissionTable';
import {findUser} from '../repository/KeyProvider';
import { hierarchy } from '../utils/repository';

function buildPermissionMap(state: RootState): PermissionMap {
  const result: PermissionMap = Object.keys(state.keys.edited).reduce((acc: PermissionMap, u: string) => { acc[u] = []; return acc; }, {});
  for (const nodeId of Object.keys(state.repository.nodes)) {
    const node = state.repository.nodes[nodeId];
    if (node.authorizedUsers) {
      node.authorizedUsers.forEach((username: string) => {
        if (result[username]) {
          result[username].push(hierarchy(state.repository.nodes, nodeId).map(n => n.name));
        }
      });
    }
  }
  return result;
}

export default connect((state: RootState, props: void) => ({
  permissionsByUser: buildPermissionMap(state),
  currentUser: state.privateKey.key ? findUser(state.keys.edited, state.privateKey.key) : null
}), (dispatch, props) => ({
  onDelete: (username: string) => dispatch(deleteUser(username))
}))(UserPermissionTable);
