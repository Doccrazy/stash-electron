import {Set} from 'immutable';
import {OptionalAction, TypedAction, TypedThunk} from './types/index';
import { AccessToggle, State } from './types/authorizedUsers';
import Node from '../domain/Node';
import {findAuthParent} from '../utils/repository';
import {getRepo, readNode} from './repository';

export enum Actions {
  OPEN = 'authorizedUsers/OPEN',
  CLOSE = 'authorizedUsers/CLOSE',
  INHERIT = 'authorizedUsers/INHERIT',
  CHANGE = 'authorizedUsers/CHANGE',
  SAVED = 'authorizedUsers/SAVED',
  BULK_TOGGLE = 'authorizedUsers/BULK_TOGGLE',
  BULK_SAVED = 'authorizedUsers/BULK_SAVED',
  BULK_RESET = 'authorizedUsers/BULK_RESET'
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
      await dispatch(readNode(authorizedUsers.nodeId));
      dispatch({
        type: Actions.SAVED,
        payload: authorizedUsers.nodeId
      });
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
      if (!authParent || !authParent.authorizedUsers || authParent.id === authorizedUsers.nodeId) {
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

export function bulkToggle(toggle: AccessToggle): Action {
  return {
    type: Actions.BULK_TOGGLE,
    payload: toggle
  };
}

export function bulkSave(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const bulkChanges = getState().authorizedUsers.bulkChanges;
    const allNodes = getState().repository.nodes;
    if (bulkChanges.isEmpty()) {
      return;
    }

    const repo = getRepo();

    // group changes by node, apply, then save
    await Promise.all(bulkChanges.groupBy(v => v!.nodeId)
      .filter((g, nodeId: string) => !!allNodes[nodeId].authorizedUsers && !allNodes[nodeId].authorizedUsers!.isEmpty())
      .map((g, nodeId: string) => {
        let authorizedUsers = allNodes[nodeId].authorizedUsers!;
        g!.forEach((ch: AccessToggle) => {
          authorizedUsers = authorizedUsers.includes(ch.username) ? authorizedUsers.remove(ch.username) : authorizedUsers.add(ch.username);
        });
        return repo.setAuthorizedUsers(nodeId, authorizedUsers!.toArray());
      })
      .valueSeq().toArray()
    );
    // refresh all changed nodes
    await Promise.all(bulkChanges.groupBy(v => v!.nodeId)
      .map((g, nodeId: string) => dispatch(readNode(nodeId)))
      .valueSeq().toArray()
    );

    dispatch({
      type: Actions.BULK_SAVED
    });
  };
}

export function bulkReset(): Action {
  return {
    type: Actions.BULK_RESET
  };
}

type Action =
  TypedAction<Actions.OPEN, { node: Node }>
  | OptionalAction<Actions.CLOSE>
  | OptionalAction<Actions.INHERIT>
  | TypedAction<Actions.CHANGE, Set<string>>
  | TypedAction<Actions.SAVED, string>
  | TypedAction<Actions.BULK_TOGGLE, AccessToggle>
  | OptionalAction<Actions.BULK_SAVED>
  | OptionalAction<Actions.BULK_RESET>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { bulkChanges: Set() }, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
      const newState: State = {
        nodeId: action.payload.node.id,
        inherited: !action.payload.node.authorizedUsers && !!action.payload.node.parentId,
        users: action.payload.node.authorizedUsers || Set(),
        bulkChanges: Set()
      };
      return { ...newState, initialInherited: newState.inherited, initialUsers: newState.users };
    case Actions.CLOSE:
      return { bulkChanges: Set() };
    case Actions.INHERIT:
      return { ...state, inherited: true, users: Set() };
    case Actions.CHANGE:
      return { ...state, inherited: false, users: action.payload };
    case Actions.BULK_TOGGLE:
      const existing = state.bulkChanges.find(c => c!.nodeId === action.payload.nodeId && c!.username === action.payload.username);
      return { ...state, bulkChanges: existing ? state.bulkChanges.remove(existing) : state.bulkChanges.add(action.payload) };
    case Actions.BULK_SAVED:
    case Actions.BULK_RESET:
      return { ...state, bulkChanges: Set() };
    default:
      return state;
  }
}
