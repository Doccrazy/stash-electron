import { connect } from 'react-redux';
import 'redux-thunk';
import * as naturalCompare from 'natural-compare';
import Folder from '../components/Folder';
import { toggle } from '../actions/treeState';
import { prepareDelete, select } from '../actions/currentNode';
import { moveEntry } from '../actions/repository';
import { open as openPermissions } from '../actions/authorizedUsers';
import {RootState} from '../actions/types/index';
import Node from '../domain/Node';
import {isAccessible} from '../utils/repository';
import {formatUserList} from '../utils/format';
import EntryPtr from '../domain/EntryPtr';

export interface Props {
  nodeId: string
}

function sortedChildIds(nodes: { [id: string]: Node }, nodeId: string) {
  const node = nodes[nodeId];
  return node.childIds.sort((id1, id2) => naturalCompare(nodes[id1].name.toLowerCase(), nodes[id2].name.toLowerCase()))
    .toArray();
}

function isVisible(parentAccessible: boolean, nodeId: string, nodes: { [id: string]: Node }, username?: string, currentNodeId?: string): boolean {
  const node = nodes[nodeId];
  return (!node.authorizedUsers ? parentAccessible : (!!username && node.authorizedUsers.includes(username)))
    || nodeId === currentNodeId
    || !!node.childIds.find(cid => isVisible(false, cid!, nodes, username, currentNodeId));
}

export default connect((state: RootState, props: Props) => {
  const node = state.repository.nodes[props.nodeId];
  const accessible = isAccessible(state.repository.nodes, props.nodeId, state.privateKey.username);
  let childIds = sortedChildIds(state.repository.nodes, props.nodeId);
  if (state.settings.current.hideInaccessible) {
    childIds = childIds.filter(cid => isVisible(accessible, cid, state.repository.nodes, state.privateKey.username, state.currentNode.nodeId));
  }
  return ({
    label: node.name,
    childIds,
    expanded: state.treeState.has(props.nodeId),
    selected: !state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
    marked: !!state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
    accessible,
    authInfo: node.authorizedUsers && formatUserList('Accessible to ', node.authorizedUsers, state.privateKey.username),
    onCheckDropEntry: (ptr: EntryPtr) => ptr.nodeId !== props.nodeId && accessible
  });
}, (dispatch, props) => ({
  onClickIcon: () => dispatch(toggle(props.nodeId)),
  onClickLabel: () => dispatch(select(props.nodeId)),
  onClickAuth: () => dispatch(openPermissions(props.nodeId)),
  onDelete: () => dispatch(prepareDelete(props.nodeId)),
  onDropEntry: (ptr: EntryPtr) => dispatch(moveEntry(ptr, props.nodeId))
}))(Folder);
