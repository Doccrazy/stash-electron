import {ThunkAction} from 'redux-thunk';
import {Action as ReduxAction, Dispatch as ReduxDispatch} from 'redux';

import {RouterState} from 'react-router-redux';
import {ToastrState} from 'react-redux-toastr';

import { State as AuthorizedUsersState } from './authorizedUsers';
import { State as CredentialsState } from './credentials';
import { State as CurrentEntryState } from './currentEntry';
import { State as CurrentNodeState } from './currentNode';
import { State as EditState } from './edit';
import { State as EntryDetailsState } from './entryDetails';
import { State as ExternalState } from './external';
import { State as FavoritesState } from './favorites';
import { State as FileImportState } from './fileImport';
import { State as GitState } from './git';
import { State as KeysState } from './keys';
import { State as PrivateKeyState } from './privateKey';
import { State as RepositoryState } from './repository';
import { State as SearchState } from './search';
import { State as SettingsState } from './settings';
import { State as TreeStateState } from './treeState';
import { State as UsersHistoryState } from './usersHistory';

export interface RootState {
  authorizedUsers: AuthorizedUsersState,
  credentials: CredentialsState,
  currentEntry: CurrentEntryState,
  currentNode: CurrentNodeState,
  edit: EditState,
  entryDetails: EntryDetailsState,
  external: ExternalState,
  favorites: FavoritesState,
  fileImport: FileImportState,
  git: GitState,
  keys: KeysState,
  privateKey: PrivateKeyState,
  repository: RepositoryState,
  search: SearchState,
  settings: SettingsState,
  treeState: TreeStateState,
  usersHistory: UsersHistoryState,

  router: RouterState,
  toastr: ToastrState
}

export type Thunk<R> = ThunkAction<R, RootState, void>;

export interface Action<P> extends ReduxAction {
  type: string,
  payload?: P
}

export type Dispatch = ReduxDispatch<RootState>;

export type GetState = () => RootState;

interface GenericAction<T extends string, P> extends Action<P> {
  // add a type that is never used, to enforce a 'default' case
  type: T | '__unfug__'
}
export interface TypedAction<T extends string, P> extends GenericAction<T, P> {
  payload: P;
}
export type OptionalAction<T extends string, P = void> = GenericAction<T, P>;

export interface TypedDispatch<T> {
  <A extends T>(action: A): A;
  <R>(asyncAction: Thunk<R>): R;
}

export type TypedThunk<T, R> = (dispatch: TypedDispatch<T>, getState: GetState) => R;
