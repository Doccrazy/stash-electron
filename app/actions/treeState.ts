import { Set } from 'immutable';
import { TypedAction, TypedThunk, TypedDispatch, GetState } from './types';
import { State } from './types/treeState';
import * as Repository from './repository';
import { hierarchy } from '../utils/repository';
import { afterAction } from '../store/eventMiddleware';

export enum Actions {
  EXPAND = 'treeState/EXPAND',
  SET_EXPAND = 'treeState/SET_EXPAND',
  CLOSE = 'treeState/CLOSE'
}

const MULTI_OPEN = false;

function maybeExpand(dispatch: TypedDispatch<Action>, getState: GetState, nodeId: string) {
  const { repository, treeState } = getState();
  if (repository.nodes[nodeId] && repository.nodes[nodeId].childIds.size && !treeState.has(nodeId)) {
    if (MULTI_OPEN) {
      dispatch({
        type: Actions.EXPAND,
        payload: nodeId
      });
    } else {
      dispatch({
        type: Actions.SET_EXPAND,
        payload: hierarchy(repository.nodes, nodeId).map(node => node.id)
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

afterAction(Repository.Actions.CREATE_NODE, (dispatch, getState: GetState, { parentNodeId, name }) => {
  maybeExpand(dispatch, getState, parentNodeId);
});

afterAction(Repository.Actions.DELETE_NODE, (dispatch, getState: GetState, nodeId) => {
  dispatch(close(nodeId));
});

afterAction(Repository.Actions.RENAME_NODE, (dispatch, getState: GetState, { nodeId, newParentId, newName }) => {
  dispatch(close(nodeId));
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
