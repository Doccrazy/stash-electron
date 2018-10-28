import * as fs from 'fs-extra';
import { Set } from 'immutable';
import * as path from 'path';
import EntryPtr from '../domain/EntryPtr';
import StashLink from '../domain/StashLink';
import { afterAction } from '../store/eventMiddleware';
import * as Repository from './repository';
import { State } from './types/favorites';
import { Dispatch, GetState, OptionalAction, TypedAction, TypedThunk } from './types/index';

export enum Actions {
  ADD = 'favorites/ADD',
  REMOVE = 'favorites/REMOVE',
  SET = 'favorites/SET',
  SAVED = 'favorites/SAVED'
}

export const FILENAME = '.favorites.json';

interface FavoritesFile {
  favorites?: string[]
}

export function add(ptr: EntryPtr): Action {
  return {
    type: Actions.ADD,
    payload: ptr
  };
}

export function remove(ptr: EntryPtr): Action {
  return {
    type: Actions.REMOVE,
    payload: ptr
  };
}

export function toggle(ptr: EntryPtr): Thunk<any> {
  return (dispatch, getState) => {
    const { favorites } = getState();
    return dispatch(favorites.has(ptr) ? remove(ptr) : add(ptr));
  };
}

export function toggleAndSave(ptr: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch(toggle(ptr));
    await dispatch(saveForRepo());
  };
}

export function set(newFavorites: Set<EntryPtr>): Action {
  return {
    type: Actions.SET,
    payload: newFavorites
  };
}

export function loadForRepo(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const repoPath = getState().repository.path!;
    const filename = path.join(repoPath, FILENAME);
    if (fs.existsSync(filename)) {
      const parsed = JSON.parse(await fs.readFile(filename, 'utf8')) as FavoritesFile;
      if (parsed.favorites) {
        dispatch(set(Set(parsed.favorites.map(href => StashLink.parse(href).toEntryPtr()))));
      }
    } else {
      dispatch(set(Set()));
    }
  };
}

export function saveForRepo(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { favorites } = getState();
    const repoPath = getState().repository.path!;
    const filename = path.join(repoPath, FILENAME);
    const serialized: FavoritesFile = {
      favorites: favorites.map((ptr: EntryPtr) => new StashLink(ptr).toUri()).toArray()
    };
    await fs.writeFile(filename, JSON.stringify(serialized, null, '  '));
    dispatch({ type: Actions.SAVED });
  };
}

afterAction(Repository.Actions.FINISH_LOAD, (dispatch: Dispatch, getState: GetState) => {
  dispatch(loadForRepo());
});

type Action =
  TypedAction<Actions.ADD, EntryPtr>
  | TypedAction<Actions.REMOVE, EntryPtr>
  | TypedAction<Actions.SET, Set<EntryPtr>>
  | OptionalAction<Actions.SAVED>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = Set(), action: Action): State {
  switch (action.type) {
    case Actions.ADD:
      return state.add(action.payload);
    case Actions.REMOVE:
      return state.delete(action.payload);
    case Actions.SET:
      return action.payload;
    default:
      return state;
  }
}
