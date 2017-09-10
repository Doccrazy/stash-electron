import { Set } from 'immutable';
import { Action, Thunk, Dispatch, GetState } from './types';
import { State } from './types/treeState';
import * as repoActions from './repository';
import { hierarchy } from '../utils/repository';
import { afterAction } from '../store/eventMiddleware';

const EXPAND = 'treeState/EXPAND';
const SET_EXPAND = 'treeState/SET_EXPAND';
const CLOSE = 'treeState/CLOSE';

const MULTI_OPEN = false;

function maybeExpand(dispatch: Dispatch, getState: GetState, nodeId: string) {
  const { repository, treeState } = getState();
  if (repository.nodes[nodeId] && repository.nodes[nodeId].childIds.size && !treeState.has(nodeId)) {
    if (MULTI_OPEN) {
      dispatch({
        type: EXPAND,
        payload: nodeId
      });
    } else {
      dispatch({
        type: SET_EXPAND,
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

export function close(nodeId: string): Action<string> {
  return {
    type: CLOSE,
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

afterAction(repoActions.CREATE_NODE, (dispatch, getState: GetState, { parentNodeId, name }) => {
  maybeExpand(dispatch, getState, parentNodeId);
});

afterAction(repoActions.DELETE_NODE, (dispatch, getState: GetState, nodeId) => {
  dispatch(close(nodeId));
});

afterAction(repoActions.RENAME_NODE, (dispatch, getState: GetState, { nodeId, newParentId, newName }) => {
  dispatch(close(nodeId));
});

export default function reducer(state: State = Set(), action: Action<any>): State {
  switch (action.type) {
    case EXPAND:
      return state.add(action.payload);
    case SET_EXPAND:
      return Set(action.payload);
    case CLOSE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
