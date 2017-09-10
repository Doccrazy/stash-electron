import { toastr } from 'react-redux-toastr';
import * as repoActions from './repository';
import { expand } from './treeState';
import { afterAction } from '../store/eventMiddleware';
import { childNodeByName, cleanFileName, hasChildOrEntry } from '../utils/repository';
import {State} from './types/currentNode';
import {Action, GetState, Thunk} from './types/index';

export const SELECT = 'currentNode/SELECT';
export const SELECT_SPECIAL = 'currentNode/SELECT_SPECIAL';
export const PREPARE_DELETE = 'currentNode/PREPARE_DELETE';
export const CANCEL_DELETE = 'currentNode/CANCEL_DELETE';
export const START_RENAME = 'currentNode/START_RENAME';
export const START_CREATE = 'currentNode/START_CREATE';
export const CHANGE_NAME = 'currentNode/CHANGE_NAME';
export const CLOSE_EDIT = 'currentNode/CLOSE_EDIT';

export function select(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    if (!repository.nodes[nodeId]) {
      return;
    }

    await dispatch(expand(nodeId));
    dispatch({
      type: SELECT,
      payload: nodeId
    });
  };
}

export function selectSpecial(specialId: string): Action<string> {
  return {
    type: SELECT_SPECIAL,
    payload: specialId
  };
}

export function deselect(): Action<void> {
  return {
    type: SELECT
  };
}

export function deselectSpecial(): Action<void> {
  return {
    type: SELECT_SPECIAL
  };
}

export function prepareDelete(): Thunk<void> {
  return (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      dispatch({
        type: PREPARE_DELETE
      });
    }
  };
}

export function confirmDelete(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      await dispatch(repoActions.deleteNode(currentNode.nodeId));
    }
  };
}

export function cancelDelete(): Action<void> {
  return {
    type: CANCEL_DELETE
  };
}

export function startRename(): Thunk<void> {
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

export function startCreate(): Thunk<void> {
  return (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      dispatch({
        type: START_CREATE
      });
    }
  };
}

export function changeName(name: string): Action<string> {
  return {
    type: CHANGE_NAME,
    payload: cleanFileName(name)
  };
}

export function closeEdit(): Action<void> {
  return {
    type: CLOSE_EDIT
  };
}

export function saveNode(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNode, repository } = getState();
    if (currentNode.nodeId && (currentNode.renaming || currentNode.creating)) {
      const newName = currentNode.name ? currentNode.name.trim() : currentNode.name;
      if (!newName || newName === currentNode.initialName) {
        dispatch(closeEdit());
        return;
      }

      const node = repository.nodes[currentNode.nodeId];
      const parentNode = repository.nodes[node.parentId as string];
      if (hasChildOrEntry(repository.nodes, currentNode.renaming ? parentNode : node, newName)) {
        toastr.error('', `An entry named '${newName}' already exists.`);
        return;
      }

      if (currentNode.renaming) {
        await dispatch(repoActions.renameNode(currentNode.nodeId, newName));
      } else {
        await dispatch(repoActions.createChildNode(currentNode.nodeId, newName));
        dispatch(closeEdit());
      }
    }
  };
}

afterAction(repoActions.FINISH_LOAD, dispatch => {
  dispatch(select('/'));
});

afterAction(repoActions.UNLOAD, dispatch => {
  dispatch(deselect());
});

afterAction(repoActions.DELETE_NODE, (dispatch, getState: GetState, nodeId, preActionState) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === nodeId) {
    const node = preActionState.repository.nodes[nodeId];
    if (node.parentId) {
      dispatch(select(node.parentId));
    }
  }
});

afterAction(repoActions.RENAME_NODE, (dispatch, getState: GetState, { nodeId, newParentId, newName }) => {
  const { currentNode, repository } = getState();
  if (currentNode.nodeId === nodeId) {
    const newId = childNodeByName(repository.nodes, newParentId, newName);
    if (newId) {
      dispatch(select(newId));
    }
  }
});

afterAction(repoActions.CREATE_NODE, (dispatch, getState: GetState, { parentNodeId, name }) => {
  const { currentNode } = getState();
  if (currentNode.creating) {
    dispatch(closeEdit());
  }
});

export default function reducer(state: State = {}, action: Action<any>): State {
  switch (action.type) {
    case SELECT:
      return { nodeId: action.payload };
    case SELECT_SPECIAL:
      return { nodeId: state.nodeId, specialId: action.payload };
    case PREPARE_DELETE:
      return { ...state, deleting: true };
    case CANCEL_DELETE:
      return { ...state, deleting: false };
    case START_RENAME:
      return { ...state, renaming: true, creating: false, initialName: action.payload, name: action.payload };
    case START_CREATE:
      return { ...state, renaming: false, creating: true, initialName: '', name: '' };
    case CHANGE_NAME:
      return { ...state, name: action.payload };
    case CLOSE_EDIT:
      return { ...state, renaming: false, creating: false, initialName: undefined, name: undefined };
    default:
      return state;
  }
}
