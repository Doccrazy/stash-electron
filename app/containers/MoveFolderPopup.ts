import { connect } from 'react-redux';
import { closeMove, performMoveMerge } from '../actions/currentNode';
import MoveFolderPopup from '../components/MoveFolderPopup';
import { Dispatch, RootState } from '../actions/types';
import { hasChildOrEntry, hierarchy, isFullyAccessible, isParentOrSelf } from '../utils/repository';

// move is only possible if parent is actually changing, and no name conflict occurs
function canMove(state: RootState, nodeId: string, targetNodeId: string) {
  return (
    !!state.repository.nodes[nodeId] &&
    !!state.repository.nodes[targetNodeId] &&
    state.repository.nodes[nodeId].parentId !== targetNodeId &&
    !isParentOrSelf(state.repository.nodes, nodeId, targetNodeId) &&
    !hasChildOrEntry(state.repository.nodes, state.repository.nodes[targetNodeId], state.repository.nodes[nodeId].name)
  );
}

// merging is only possible if all possibly involved items are fully accessible
function canMerge(state: RootState, nodeId: string, targetNodeId: string) {
  return (
    !isParentOrSelf(state.repository.nodes, nodeId, targetNodeId) &&
    isFullyAccessible(state.repository.nodes, nodeId, state.privateKey.username) &&
    isFullyAccessible(state.repository.nodes, targetNodeId, state.privateKey.username)
  );
}

export default connect(
  (state: RootState) => {
    if (!state.currentNode.move) {
      return { sourcePath: [], targetPath: [] };
    }
    return {
      open: true,
      sourcePath: hierarchy(state.repository.nodes, state.currentNode.move.nodeId).map((n) => n.name),
      targetPath: hierarchy(state.repository.nodes, state.currentNode.move.targetNodeId).map((n) => n.name),
      canMove: canMove(state, state.currentNode.move.nodeId, state.currentNode.move.targetNodeId),
      canMerge: canMerge(state, state.currentNode.move.nodeId, state.currentNode.move.targetNodeId)
    };
  },
  (dispatch: Dispatch) => ({
    onMove: () => dispatch(performMoveMerge(false)),
    onMerge: () => dispatch(performMoveMerge(true)),
    onClose: () => dispatch(closeMove())
  })
)(MoveFolderPopup);
