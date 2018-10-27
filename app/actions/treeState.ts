import { Set } from 'immutable';
import { TypedAction, TypedThunk, Dispatch, GetState } from './types';
import { State } from './types/treeState';
import * as Repository from './repository';
import { hierarchy } from '../utils/repository';
import { afterAction } from '../store/eventMiddleware';
import Node from '../domain/Node';

export enum Actions {
  EXPAND = 'treeState/EXPAND',
  SET_EXPAND = 'treeState/SET_EXPAND',
  CLOSE = 'treeState/CLOSE'
}

const MULTI_OPEN = false;

function maybeExpand(dispatch: Dispatch<Action>, getState: GetState, nodeId: string) {
  const { repository, treeState } = getState();
  let node = repository.nodes[nodeId];
  // if node is a leaf, expand parent instead
  if (node && node.parentId && node.childIds.size === 0) {
    node = repository.nodes[node.parentId];
  }
  if (node && node.childIds.size && !treeState.has(node.id)) {
    if (MULTI_OPEN) {
      dispatch({
        type: Actions.EXPAND,
        payload: node.id
      });
    } else {
      dispatch({
        type: Actions.SET_EXPAND,
        payload: hierarchy(repository.nodes, node.id).map(n => n.id)
      });
    }
  }
}

export function expand(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    if (!repository.nodes[nodeId]) {
      return;
    }

    // await dispatch(repoActions.readNode(nodeId));

    maybeExpand(dispatch, getState, nodeId);
  };
}

export function close(nodeId: string): Action {
  return {
    type: Actions.CLOSE,
    payload: nodeId
  };
}

export function toggle(nodeId: string): Thunk<void> {
  return (dispatch, getState) => {
    const { treeState } = getState();
    if (treeState.has(nodeId)) {
      dispatch(close(nodeId));
    } else {
      dispatch(expand(nodeId));
    }
  };
}

afterAction(Repository.Actions.CREATE_NODE, (dispatch, getState: GetState, newNode: Node) => {
  if (newNode.parentId) {
    maybeExpand(dispatch, getState, newNode.parentId);
  }
});

afterAction(Repository.Actions.DELETE_NODE, (dispatch, getState: GetState, node: Node) => {
  dispatch(close(node.id));
});

afterAction(Repository.Actions.MOVE_NODE, (dispatch, getState: GetState, { node, newNode }) => {
  dispatch(close(node.id));
});

type Action =
  TypedAction<Actions.EXPAND, string>
  | TypedAction<Actions.SET_EXPAND, string[]>
  | TypedAction<Actions.CLOSE, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = Set(), action: Action): State {
  switch (action.type) {
    case Actions.EXPAND:
      return state.add(action.payload);
    case Actions.SET_EXPAND:
      return Set(action.payload);
    case Actions.CLOSE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
