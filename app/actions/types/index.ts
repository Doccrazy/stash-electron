import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import {Action as ReduxAction} from 'redux';

import {RouterState} from 'connected-react-router';
import {ToastrState} from 'react-redux-toastr';

import { State as AuthorizedUsersState } from './authorizedUsers';
import { State as CredentialsState } from './credentials';
import { State as CurrentEntryState } from './currentEntry';
import { State as CurrentNodeState } from './currentNode';
import { State as EditState } from './edit';
import { State as EntryDetailsState } from './entryDetails';
import { State as ExternalState } from './external';
import { State as FavoritesState } from './favorites';
import { State as FileExportState } from './fileExport';
import { State as FileImportState } from './fileImport';
import { State as GitState } from './git';
import { State as KeysState } from './keys';
import { State as NodeHistoryState } from './nodeHistory';
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
  fileExport: FileExportState,
  fileImport: FileImportState,
  git: GitState,
  keys: KeysState,
  nodeHistory: NodeHistoryState,
  privateKey: PrivateKeyState,
  repository: RepositoryState,
  search: SearchState,
  settings: SettingsState,
  treeState: TreeStateState,
  usersHistory: UsersHistoryState,

  router: RouterState,
  toastr: ToastrState
}

export type Thunk<R> = TypedThunk<Action<any>, R>;

export interface Action<P> extends ReduxAction {
  type: string,
  payload?: P
}

export type Dispatch<A extends Action<any> = Action<any>> = ThunkDispatch<RootState, void, A>;

export type GetState = () => RootState;

interface GenericAction<T extends string, P> extends Action<P> {
  // add a type that is never used, to enforce a 'default' case
  type: T | '__unfug__'
}
export interface TypedAction<T extends string, P> extends GenericAction<T, P> {
  payload: P;
}
export type OptionalAction<T extends string, P = void> = GenericAction<T, P>;

export type TypedThunk<A extends Action<any>, R> = ThunkAction<R, RootState, void, A>;
