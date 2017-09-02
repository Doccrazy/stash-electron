import { toastr } from 'react-redux-toastr';
import { expand, deleteNode, renameNode, repositoryEvents } from './repository';
import { cleanFileName } from '../utils/repository';

const SELECT = 'currentNode/SELECT';
const PREPARE_DELETE = 'currentNode/PREPARE_DELETE';
const CANCEL_DELETE = 'currentNode/CANCEL_DELETE';
const START_RENAME = 'currentNode/START_RENAME';
const CHANGE_NAME = 'currentNode/CHANGE_NAME';
const CLOSE_RENAME = 'currentNode/CLOSE_RENAME';

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

export function startRename() {
  return (dispatch, getState) => {
    const { currentNode, repository } = getState();
    if (currentNode.nodeId) {
      dispatch({
        type: START_RENAME,
        payload: repository.nodes[currentNode.nodeId].name
      });
    }
  };
}

export function changeName(name) {
  return {
    type: CHANGE_NAME,
    payload: cleanFileName(name)
  };
}

export function closeRename() {
  return {
    type: CLOSE_RENAME
  };
}

export function saveNode() {
  return async (dispatch, getState) => {
    const { currentNode, repository } = getState();
    if (currentNode.nodeId && currentNode.renaming) {
      const newName = currentNode.name ? currentNode.name.trim() : currentNode.name;
      if (!newName || newName === currentNode.initialName) {
        dispatch(closeRename());
        return;
      }

      const parentId = repository.nodes[currentNode.nodeId].parent;
      const parentNode = repository.nodes[parentId];
      if (parentNode.children.find(child => repository.nodes[child].name === newName)) {
        toastr.error(`A folder named '${newName}' already exists.`);
        return;
      }

      await dispatch(renameNode(currentNode.nodeId, newName));
    }
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

repositoryEvents.on('moveNode', (dispatch, getState, nodeId, newId) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === nodeId) {
    dispatch(select(newId));
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
    case START_RENAME:
      return { ...state, renaming: true, initialName: action.payload, name: action.payload };
    case CHANGE_NAME:
      return { ...state, name: action.payload };
    case CLOSE_RENAME:
      return { ...state, renaming: false, initialName: null, name: null };
    default:
      return state;
  }
}
