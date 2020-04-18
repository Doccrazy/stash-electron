import { connect } from 'react-redux';
import 'redux-thunk';
import naturalCompare from 'natural-compare';
import { nodeContextMenu } from '../actions/contextMenus';
import Folder from '../components/Folder';
import { toggle } from '../actions/treeState';
import { prepareMove, select } from '../actions/currentNode';
import { moveEntry } from '../actions/repository';
import { open as openPermissions } from '../actions/authorizedUsers';
import { Dispatch, RootState } from '../actions/types/index';
import Node, { ROOT_ID } from '../domain/Node';
import { isAccessible, isParentOrSelf } from '../utils/repository';
import { formatUserList } from '../utils/format';
import EntryPtr from '../domain/EntryPtr';

export interface Props {
  nodeId: string;
}

function sortedChildIds(nodes: { [id: string]: Node }, nodeId: string) {
  const node = nodes[nodeId];
  return node.childIds.sort((id1, id2) => naturalCompare(nodes[id1].name.toLowerCase(), nodes[id2].name.toLowerCase())).toArray();
}

function isVisible(
  parentAccessible: boolean,
  nodeId: string,
  nodes: { [id: string]: Node },
  username?: string,
  currentNodeId?: string
): boolean {
  const node = nodes[nodeId];
  return (
    (!node.authorizedUsers ? parentAccessible : !!username && node.authorizedUsers.includes(username)) ||
    nodeId === currentNodeId ||
    !!node.childIds.find((cid) => isVisible(false, cid, nodes, username, currentNodeId))
  );
}

export default connect(
  (state: RootState, props: Props) => {
    const node = state.repository.nodes[props.nodeId];
    const accessible = isAccessible(state.repository.nodes, props.nodeId, state.privateKey.username);
    let childIds = sortedChildIds(state.repository.nodes, props.nodeId);
    if (state.settings.current.hideInaccessible) {
      childIds = childIds.filter((cid) =>
        isVisible(accessible, cid, state.repository.nodes, state.privateKey.username, state.currentNode.nodeId)
      );
    }
    return {
      nodeId: props.nodeId,
      label: node.name,
      childIds,
      expanded: state.treeState.has(props.nodeId),
      selected: !state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
      marked: !!state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
      nodeEditable: props.nodeId !== ROOT_ID,
      accessible,
      authInfo: node.authorizedUsers && formatUserList('common.accessibleTo', node.authorizedUsers, state.privateKey.username),
      onCheckDropEntry: (ptr: EntryPtr) => ptr.nodeId !== props.nodeId && accessible,
      onCheckDropNode: (nodeId: string) => !isParentOrSelf(state.repository.nodes, nodeId, props.nodeId) && accessible
    };
  },
  (dispatch: Dispatch, props) => ({
    onClickIcon: () => dispatch(toggle(props.nodeId)),
    onClickLabel: () => dispatch(select(props.nodeId)),
    onClickAuth: () => dispatch(openPermissions(props.nodeId)),
    onDropEntry: (ptr: EntryPtr) => dispatch(moveEntry(ptr, props.nodeId)),
    onDropNode: (nodeId: string) => dispatch(prepareMove(nodeId, props.nodeId)),
    onContextMenu: () => dispatch(nodeContextMenu(props.nodeId))
  })
)(Folder);
