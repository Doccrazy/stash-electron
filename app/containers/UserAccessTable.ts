import { Set } from 'immutable';
import { connect } from 'react-redux';
import { bulkToggle } from '../actions/authorizedUsers';
import { Dispatch, RootState } from '../actions/types';
import UserAccessTable from '../components/UserAccessTable';
import Node from '../domain/Node';
import { findUser } from '../repository/KeyProvider';
import { hierarchy } from '../utils/repository';

function buildAuthNodes(nodes: { [nodeId: string]: Node }) {
  return Set(Object.values(nodes).filter(n => n.authorizedUsers && n.authorizedUsers.size))
    .flatMap((node: Node) => hierarchy(nodes, node))
    .sortBy((node: Node) => node.id)  // TODO sorting by ID is a bit hacky
    .map((node: Node) => ({ node, level: hierarchy(nodes, node).length - 1, relevant: !!node.authorizedUsers && !!node.authorizedUsers.size }))
    .toArray();
}

export default connect((state: RootState, props: {}) => ({
  users: Object.keys(state.keys.edited).sort(),
  authorizationNodes: buildAuthNodes(state.repository.nodes),
  currentUser: state.privateKey.key ? findUser(state.keys.edited, state.privateKey.key) : null,
  modifications: state.authorizedUsers.bulkChanges
}), (dispatch: Dispatch, props) => ({
  onToggle: (node: Node, username: string) => { dispatch(bulkToggle({ nodeId: node.id, username })); }
}))(UserAccessTable);
