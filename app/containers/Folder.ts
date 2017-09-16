import { connect } from 'react-redux';
import 'redux-thunk';
import naturalCompare from 'natural-compare';
import Folder from '../components/Folder';
import { toggle } from '../actions/treeState';
import { select } from '../actions/currentNode';
import {RootState} from '../actions/types/index';
import Node from '../domain/Node';

export interface Props {
  nodeId: string
}

function sortedChildIds(nodes: { [id: string]: Node }, nodeId: string) {
  const node = nodes[nodeId];
  return node.childIds.sort((id1, id2) => naturalCompare(nodes[id1].name.toLowerCase(), nodes[id2].name.toLowerCase()))
    .toArray();
}

export default connect((state: RootState, props: Props) => ({
  label: state.repository.nodes[props.nodeId].name,
  childIds: sortedChildIds(state.repository.nodes, props.nodeId),
  expanded: state.treeState.has(props.nodeId),
  selected: !state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
  marked: !!state.currentNode.specialId && state.currentNode.nodeId === props.nodeId
}), (dispatch, props) => ({
   onClickIcon: () => dispatch(toggle(props.nodeId)),
   onClickLabel: () => dispatch(select(props.nodeId))
}))(Folder);
