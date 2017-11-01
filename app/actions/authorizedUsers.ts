import {Set} from 'immutable';
import {OptionalAction, TypedAction, TypedThunk} from './types/index';
import {State} from './types/authorizedUsers';
import Node from '../domain/Node';
import {findAuthParent} from '../utils/repository';
import {getRepo, readNode} from './repository';

export enum Actions {
  OPEN = 'authorizedUsers/OPEN',
  CLOSE = 'authorizedUsers/CLOSE',
  INHERIT = 'authorizedUsers/INHERIT',
  CHANGE = 'authorizedUsers/CHANGE'
}

export function open(nodeId: string): Thunk<void> {
  return (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    dispatch({
      type: Actions.OPEN,
      payload: {
        node
      }
    });
  };
}

export function openCurrent(): Thunk<void> {
  return (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      dispatch(open(currentNode.nodeId));
    }
  };
}

export function close(): Action {
  return {
    type: Actions.CLOSE
  };
}

export function save(): Thunk<void> {
  return async (dispatch, getState) => {
    const { authorizedUsers } = getState();
    if (authorizedUsers.nodeId) {
      const repo = getRepo();
      await repo.setAuthorizedUsers(authorizedUsers.nodeId, authorizedUsers.users ? authorizedUsers.users.toArray() : undefined);
      dispatch(readNode(authorizedUsers.nodeId));
    }

    dispatch(close());
  };
}

export function toggleInherit(): Thunk<void> {
  return (dispatch, getState) => {
    const { authorizedUsers, repository } = getState();
    if (!authorizedUsers.nodeId) {
      return;
    }
    if (authorizedUsers.inherited) {
      const authParent = findAuthParent(repository.nodes, authorizedUsers.nodeId);
      if (!authParent.authorizedUsers || authParent.id === authorizedUsers.nodeId) {
        return;
      }
      dispatch(change(authParent.authorizedUsers));
    } else {
      dispatch({
        type: Actions.INHERIT
      });
    }
  };
}

export function change(users: Set<string>): Action {
  return {
    type: Actions.CHANGE,
    payload: users
  };
}

type Action =
  TypedAction<Actions.OPEN, { node: Node }>
  | OptionalAction<Actions.CLOSE>
  | OptionalAction<Actions.INHERIT>
  | TypedAction<Actions.CHANGE, Set<string>>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
      const newState = {
        nodeId: action.payload.node.id,
        inherited: !action.payload.node.authorizedUsers && !!action.payload.node.parentId,
        users: action.payload.node.authorizedUsers || Set()
      };
      return { ...newState, initialInherited: newState.inherited, initialUsers: newState.users };
    case Actions.CLOSE:
      return {};
    case Actions.INHERIT:
      return { ...state, inherited: true, users: Set() };
    case Actions.CHANGE:
      return { ...state, inherited: false, users: action.payload };
    default:
      return state;
  }
}
