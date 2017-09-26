import { connect } from 'react-redux';
import 'redux-thunk';
import naturalCompare from 'natural-compare';
import Folder from '../components/Folder';
import { toggle } from '../actions/treeState';
import { select } from '../actions/currentNode';
import {RootState} from '../actions/types/index';
import Node from '../domain/Node';
import {isAccessible} from '../utils/repository';
import {formatUserList} from '../utils/format';

export interface Props {
  nodeId: string
}

function sortedChildIds(nodes: { [id: string]: Node }, nodeId: string) {
  const node = nodes[nodeId];
  return node.childIds.sort((id1, id2) => naturalCompare(nodes[id1].name.toLowerCase(), nodes[id2].name.toLowerCase()))
    .toArray();
}

export default connect((state: RootState, props: Props) => {
  const node = state.repository.nodes[props.nodeId];
  return ({
    label: node.name,
    childIds: sortedChildIds(state.repository.nodes, props.nodeId),
    expanded: state.treeState.has(props.nodeId),
    selected: !state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
    marked: !!state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
    accessible: isAccessible(state.repository.nodes, props.nodeId, state.privateKey.username),
    authInfo: node.authorizedUsers && formatUserList('Accessible to ', node.authorizedUsers, state.privateKey.username)
  });
}, (dispatch, props) => ({
   onClickIcon: () => dispatch(toggle(props.nodeId)),
   onClickLabel: () => dispatch(select(props.nodeId))
}))(Folder);
