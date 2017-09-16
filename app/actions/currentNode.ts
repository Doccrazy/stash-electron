import { toastr } from 'react-redux-toastr';
import {List} from 'immutable';
import * as Repository from './repository';
import { expand } from './treeState';
import { afterAction } from '../store/eventMiddleware';
import { cleanFileName, hasChildOrEntry } from '../utils/repository';
import {State} from './types/currentNode';
import {GetState, TypedAction, TypedThunk, OptionalAction} from './types/index';
import Node, {ROOT_ID} from '../domain/Node';
import {SpecialFolderId} from '../utils/specialFolders';

export enum Actions {
  SELECT = 'currentNode/SELECT',
  SELECT_SPECIAL = 'currentNode/SELECT_SPECIAL',
  PREPARE_DELETE = 'currentNode/PREPARE_DELETE',
  CANCEL_DELETE = 'currentNode/CANCEL_DELETE',
  START_RENAME = 'currentNode/START_RENAME',
  START_CREATE = 'currentNode/START_CREATE',
  CHANGE_NAME = 'currentNode/CHANGE_NAME',
  CLOSE_EDIT = 'currentNode/CLOSE_EDIT'
}

export function select(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    if (!repository.nodes[nodeId]) {
      return;
    }

    await dispatch(expand(nodeId));
    dispatch({
      type: Actions.SELECT,
      payload: nodeId
    });
  };
}

export function selectSpecial(specialId: SpecialFolderId): Action {
  return {
    type: Actions.SELECT_SPECIAL,
    payload: specialId
  };
}

export function deselect(): Action {
  return {
    type: Actions.SELECT
  };
}

export function deselectSpecial(): Action {
  return {
    type: Actions.SELECT_SPECIAL
  };
}

export function prepareDelete(): Thunk<void> {
  return (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      dispatch({
        type: Actions.PREPARE_DELETE
      });
    }
  };
}

export function confirmDelete(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      await dispatch(Repository.deleteNode(currentNode.nodeId));
    }
  };
}

export function cancelDelete(): Action {
  return {
    type: Actions.CANCEL_DELETE
  };
}

export function startRename(): Thunk<void> {
  return (dispatch, getState) => {
    const { currentNode, repository } = getState();
    if (currentNode.nodeId && currentNode.nodeId !== ROOT_ID) {
      dispatch({
        type: Actions.START_RENAME,
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
        type: Actions.START_CREATE
      });
    }
  };
}

export function changeName(name: string): Action {
  return {
    type: Actions.CHANGE_NAME,
    payload: cleanFileName(name)
  };
}

export function closeEdit(): Action {
  return {
    type: Actions.CLOSE_EDIT
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
        await dispatch(Repository.renameNode(currentNode.nodeId, newName));
      } else {
        await dispatch(Repository.createChildNode(currentNode.nodeId, newName));
        dispatch(closeEdit());
      }
    }
  };
}

afterAction(Repository.Actions.FINISH_LOAD, dispatch => {
  dispatch(select('/'));
});

afterAction(Repository.Actions.UNLOAD, dispatch => {
  dispatch(deselect());
});

afterAction(Repository.Actions.DELETE_NODE, (dispatch, getState: GetState, nodeId, preActionState) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === nodeId) {
    const node = preActionState.repository.nodes[nodeId];
    if (node.parentId) {
      dispatch(select(node.parentId));
    }
  }
});

afterAction(Repository.Actions.MOVE_NODE, (dispatch, getState: GetState, { nodeId, newNode }) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === nodeId) {
    dispatch(select(newNode.id));
  }
});

afterAction(Repository.Actions.CREATE_NODE, (dispatch, getState: GetState, newNode: Node) => {
  const { currentNode } = getState();
  if (currentNode.creating) {
    dispatch(closeEdit());
  }
});

// when a currently selected node, that is not expanded, is re-read from disk, try to expand it
// Note: this is mainly used when renaming nodes
afterAction(Repository.Actions.READ_NODE_LIST, (dispatch, getState: GetState, nodes: List<Node>) => {
  const { currentNode, treeState } = getState();
  if (currentNode.nodeId && !treeState.includes(currentNode.nodeId)) {
    const nodeFromList = nodes.find((n: Node) => n.id === currentNode.nodeId);
    if (nodeFromList && nodeFromList.childIds.size) {
      dispatch(expand(currentNode.nodeId));
    }
  }
});

type Action =
  OptionalAction<Actions.SELECT, string>
  | OptionalAction<Actions.SELECT_SPECIAL, SpecialFolderId>
  | OptionalAction<Actions.PREPARE_DELETE>
  | OptionalAction<Actions.CANCEL_DELETE>
  | TypedAction<Actions.START_RENAME, string>
  | OptionalAction<Actions.START_CREATE>
  | TypedAction<Actions.CHANGE_NAME, string>
  | OptionalAction<Actions.CLOSE_EDIT>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.SELECT:
      return { nodeId: action.payload };
    case Actions.SELECT_SPECIAL:
      return { nodeId: state.nodeId, specialId: action.payload };
    case Actions.PREPARE_DELETE:
      return { ...state, deleting: true };
    case Actions.CANCEL_DELETE:
      return { ...state, deleting: false };
    case Actions.START_RENAME:
      return { ...state, renaming: true, creating: false, initialName: action.payload, name: action.payload };
    case Actions.START_CREATE:
      return { ...state, renaming: false, creating: true, initialName: '', name: '' };
    case Actions.CHANGE_NAME:
      return { ...state, name: action.payload };
    case Actions.CLOSE_EDIT:
      return { ...state, renaming: false, creating: false, initialName: undefined, name: undefined };
    default:
      return state;
  }
}
