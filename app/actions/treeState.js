import { Set } from 'immutable';
import * as repoActions from './repository';
import { hierarchy } from '../utils/repository';
import { afterAction } from '../store/eventMiddleware';

const EXPAND = 'treeState/EXPAND';
const SET_EXPAND = 'treeState/SET_EXPAND';
const CLOSE = 'treeState/CLOSE';

const MULTI_OPEN = false;

function maybeExpand(dispatch, getState, nodeId) {
  const { repository, treeState } = getState();
  if (repository.nodes[nodeId].children && repository.nodes[nodeId].children.length && !treeState.has(nodeId)) {
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

export function expand(nodeId) {
  return async (dispatch, getState) => {
    await dispatch(repoActions.readDir(nodeId));

    maybeExpand(dispatch, getState, nodeId);
  };
}

export function close(nodeId) {
  return {
    type: CLOSE,
    payload: nodeId
  };
}

export function toggle(nodeId) {
  return (dispatch, getState) => {
    const { treeState } = getState();
    if (treeState.has(nodeId)) {
      dispatch(close(nodeId));
    } else {
      dispatch(expand(nodeId));
    }
  };
}

afterAction(repoActions.CREATE_NODE, (dispatch, getState, { parentNodeId, name }) => {
  maybeExpand(dispatch, getState, parentNodeId);
});

afterAction(repoActions.DELETE_NODE, (dispatch, getState, nodeId) => {
  dispatch(close(nodeId));
});

afterAction(repoActions.RENAME_NODE, (dispatch, getState, { nodeId, newParentId, newName }) => {
  dispatch(close(nodeId));
});

export default function reducer(state = new Set(), action) {
  switch (action.type) {
    case EXPAND:
      return state.add(action.payload);
    case SET_EXPAND:
      return new Set(action.payload);
    case CLOSE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
