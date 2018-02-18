import { List, Set } from 'immutable';
import * as path from 'path';
import Node from '../domain/Node';
import { FILENAME, default as UsersFile } from '../repository/UsersFile';
import { accessingRepository, GitCommitInfo, loadBlobs } from '../utils/git';
import { AuthHistory, State } from './types/usersHistory';
import { OptionalAction, TypedAction, TypedThunk } from './types';

export enum Actions {
  OPEN_USERS = 'usersHistory/OPEN_USERS',
  OPEN_AUTH = 'usersHistory/OPEN_AUTH',
  AUTH_HISTORY = 'usersHistory/AUTH_HISTORY',
  CLOSE = 'usersHistory/CLOSE',
  SET_FILTER = 'usersHistory/SET_FILTER'
}

export function open(): Thunk<void> {
  return (dispatch, getState) => {
    const location = getState().router.location;
    if (location && location.pathname === '/users') {
      dispatch(openUsers());
    } else {
      dispatch(openAuth());
    }
  };
}

export function openUsers(): Thunk<void> {
  return (dispatch, getState) => {
    if (!getState().git.status.initialized) {
      return;
    }

    dispatch({
      type: Actions.OPEN_USERS
    });
  };
}

export function openAuth(nodeId?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const git = getState().git;
    if (!git.status.initialized) {
      return;
    }
    const repoPath = getState().repository.path!;

    dispatch({
      type: Actions.OPEN_AUTH,
      payload: nodeId
    });

    const history: AuthHistory[] = [];

    // if not explicitly selected, process all nodes that have auth info
    const nodes = Object.values(getState().repository.nodes)
      .filter(node => node.id === nodeId || (!nodeId && !!node.authorizedUsers));

    // get List<GitCommitInfo> of relevant commits for each node's users file
    const commits = nodes.map(node =>
      git.history.files.get(usersFn(node.id), List<string>())
        .map(oid => git.history.commits.get(oid)!)
    );

    await accessingRepository(repoPath, async gitRepo => {
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const fileCommits = commits[i].reverse().toArray();

        const blobs = await loadBlobs(gitRepo, fileCommits, usersFn(node.id));

        let lastUsersFile: UsersFile | undefined;
        for (let commitIdx = 0; commitIdx < fileCommits.length; commitIdx++) {
          const commit = fileCommits[commitIdx];
          const blob = blobs[commitIdx];
          const usersFile = new UsersFile(blob);

          const historyEntry = makeHistoryEntry(commit, node, lastUsersFile, usersFile);
          history.push(historyEntry);
          lastUsersFile = usersFile;
        }
      }
    });
    history.sort((he1, he2) => he2.date.getTime() - he1.date.getTime());

    dispatch({
      type: Actions.AUTH_HISTORY,
      payload: history
    });
  };
}

function makeHistoryEntry(commit: GitCommitInfo, node: Node, lastUsersFile: UsersFile | undefined, usersFile: UsersFile) {
  const historyEntry: AuthHistory = {...commit, nodeId: node.id, added: [], removed: []};
  if (lastUsersFile) {
    historyEntry.added = Set(usersFile.listUsers()).subtract(Set(lastUsersFile.listUsers())).sort().toArray();
    historyEntry.removed = Set(lastUsersFile.listUsers()).subtract(Set(usersFile.listUsers())).sort().toArray();
  } else {
    historyEntry.added = usersFile.listUsers();
    historyEntry.added.sort();
  }
  return historyEntry;
}

function usersFn(nodeId: string) {
  return  path.posix.join(nodeId, FILENAME).substr(1);
}

export function setFilter(nodeId?: string): Action {
  return {
    type: Actions.SET_FILTER,
    payload: nodeId
  };
}

export function close(): Action {
  return {
    type: Actions.CLOSE
  };
}

type Action =
  OptionalAction<Actions.OPEN_USERS>
  | OptionalAction<Actions.OPEN_AUTH, string>
  | TypedAction<Actions.AUTH_HISTORY, AuthHistory[]>
  | OptionalAction<Actions.CLOSE>
  | OptionalAction<Actions.SET_FILTER, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { usersOpen: false, authOpen: false, authHistory: [] }, action: Action): State {
  switch (action.type) {
    case Actions.OPEN_USERS:
      return { ...state, usersOpen: true };
    case Actions.OPEN_AUTH:
      return { ...state, authOpen: true, authHistory: [], authNodeId: action.payload, filterNodeId: undefined };
    case Actions.AUTH_HISTORY:
      return { ...state, authHistory: action.payload };
    case Actions.SET_FILTER:
      return { ...state, filterNodeId: action.payload };
    case Actions.CLOSE:
      return { ...state, usersOpen: false, authOpen: false };
    default:
      return state;
  }
}
