import * as fs from 'fs';
import {Map} from 'immutable';
import {mapValues} from 'lodash';
import * as path from 'path';
import EntryPtr from '../domain/EntryPtr';
import {afterAction} from '../store/eventMiddleware';
import {fileList} from '../store/selectors';
import {accessingRepository, getLatestCommitsFor} from '../utils/git';
import * as CurrentNode from './currentNode';
import * as Git from './git';
import * as Repository from './repository';
import * as PrivateKey from './privateKey';
import { Dispatch, GetState, OptionalAction, RootState, TypedAction, TypedThunk } from './types';
import {DetailMap, Details, Providers, State} from './types/entryDetails';

export enum Actions {
  UPDATE = 'entryDetails/UPDATE',
  CLEAR = 'entryDetails/CLEAR',
  CLEAR_ALL = 'entryDetails/CLEAR_ALL'
}

function relpath(ptr: EntryPtr): string {
  return Repository.getRepo().resolvePath(ptr.nodeId, ptr.entry);
}

function modifiedFromFs(repoPath: string, ptr: EntryPtr) {
  try {
    return {
      date: fs.statSync(path.join(repoPath, relpath(ptr))).mtime
    };
  } catch (e) {
    return {};
  }
}

async function modified(state: RootState, entries: EntryPtr[]) {
  const repoPath = state.repository.path!;

  if (!state.git.status.initialized) {
    return entries.map(ptr => modifiedFromFs(repoPath, ptr));
  }

  const lastCommits = await accessingRepository(repoPath,
      gitRepo => getLatestCommitsFor(gitRepo, entries.map(relpath), '**/.users.json')
  );
  return entries.map(ptr => {
    const c = lastCommits ? lastCommits[relpath(ptr)] : undefined;
    return c ? {
      date: c.date,
      user: c.authorName
    } : {};
  });
}

const PROVIDERS: Providers = {
  modified
};

async function provideDetails(state: RootState, entries: EntryPtr[]): Promise<DetailMap> {
  const detailList = await Promise.all(Object.keys(PROVIDERS).map((prov: keyof typeof PROVIDERS) => PROVIDERS[prov](state, entries)));
  const detailMap: { [D in keyof Details]: Details[D][] } = {} as any;
  for (let i = 0; i < detailList.length; i++) {
    detailMap[Object.keys(PROVIDERS)[i] as keyof typeof PROVIDERS] = detailList[i];
  }

  let entryDetails: DetailMap = Map();
  for (let i = 0; i < entries.length; i++) {
    const details = mapValues(detailMap, d => d[i]);
    entryDetails = entryDetails.set(entries[i], details);
  }

  return entryDetails;
}

function fetchDetails(entries: EntryPtr[], force: boolean = false): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    if (!getState().repository.path) {
      return;
    }
    if (!force) {
      entries = entries.filter(ptr => !getState().entryDetails.has(ptr));
    }
    if (!entries.length) {
      return;
    }

    const details = await provideDetails(getState(), entries);
    dispatch(update(details));
  };
}

function fetchForVisibleEntries(force: boolean = false): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const visibleEntries = fileList(getState());

    return dispatch(fetchDetails(visibleEntries, force));
  };
}

function update(updated: DetailMap): Action {
  return {
    type: Actions.UPDATE,
    payload: updated
  };
}

function clearAll(): Action {
  return { type: Actions.CLEAR_ALL };
}

function clearFor(entries: EntryPtr[]): Action {
  return {
    type: Actions.CLEAR,
    payload: entries
  };
}

afterAction([Repository.Actions.LOAD, Repository.Actions.UNLOAD, Repository.Actions.DELETE_NODE, Repository.Actions.MOVE_NODE, PrivateKey.Actions.LOGIN],
  (dispatch, getState: GetState) => {
    dispatch(clearAll());
  }
);

afterAction([Repository.Actions.RENAME_ENTRY, Repository.Actions.DELETE_ENTRY, Repository.Actions.MOVE_ENTRY, Repository.Actions.UPDATE_ENTRY],
  (dispatch, getState: GetState, { ptr }) => {
    dispatch(clearFor([ptr]));
  }
);

afterAction([CurrentNode.Actions.SELECT, CurrentNode.Actions.SELECT_SPECIAL,
    Repository.Actions.RENAME_ENTRY, Repository.Actions.MOVE_ENTRY, Repository.Actions.UPDATE_ENTRY],
  (dispatch: Dispatch, getState: GetState) => {
    dispatch(fetchForVisibleEntries());
  }
);

afterAction([PrivateKey.Actions.LOGIN], (dispatch: Dispatch, getState: GetState) => {
  dispatch(fetchForVisibleEntries(true));
});

afterAction(Git.Actions.UPDATE_STATUS, (dispatch: Dispatch, getState: GetState, payload, preActionState) => {
  if (getState().git.status.initialized && !preActionState.git.status.initialized) {
    dispatch(fetchForVisibleEntries(true));
  }
});

type Action =
  TypedAction<Actions.UPDATE, DetailMap> |
  TypedAction<Actions.CLEAR, EntryPtr[]> |
  OptionalAction<Actions.CLEAR_ALL>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = Map(), action: Action): State {
  switch (action.type) {
    case Actions.UPDATE:
      return state.merge(action.payload);
    case Actions.CLEAR_ALL:
      return Map();
    default:
      return state;
  }
}
