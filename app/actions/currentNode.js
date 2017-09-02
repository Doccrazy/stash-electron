import { expand, deleteNode, repositoryEvents } from './repository';

const SELECT = 'currentNode/SELECT';
const PREPARE_DELETE = 'currentNode/PREPARE_DELETE';
const CANCEL_DELETE = 'currentNode/CANCEL_DELETE';

export function select(nodeId) {
  return async (dispatch, getState) => {
    await dispatch(expand(nodeId));
    // TODO use separate emitter
    repositoryEvents.emit('clearSelection', dispatch, getState);
    dispatch({
      type: SELECT,
      payload: nodeId
    });
  };
}

export function deselect() {
  return (dispatch, getState) => {
    repositoryEvents.emit('clearSelection', dispatch, getState);
    dispatch({
      type: SELECT
    });
  };
}

export function prepareDelete() {
  return (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      dispatch({
        type: PREPARE_DELETE
      });
    }
  };
}

export function confirmDelete() {
  return async (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      await dispatch(deleteNode(currentNode.nodeId));
    }
  };
}

export function cancelDelete() {
  return {
    type: CANCEL_DELETE
  };
}

repositoryEvents.on('initialize', async (dispatch, getState) => {
  await dispatch(select('/'));
});

repositoryEvents.on('deleteNode', (dispatch, getState, node) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === node.id) {
    dispatch(select(node.parent));
  }
});

export default function reducer(state = {}, action) {
  switch (action.type) {
    case SELECT:
      return { nodeId: action.payload };
    case PREPARE_DELETE:
      return { ...state, deleting: true };
    case CANCEL_DELETE:
      return { ...state, deleting: false };
    default:
      return state;
  }
}
