import {ThunkAction} from 'redux-thunk';
import {Action as ReduxAction, Dispatch as ReduxDispatch} from 'redux';

import {RouterState} from 'react-router-redux';
import {ToastrState} from 'react-redux-toastr';

import { State as CurrentEntryState } from './currentEntry';
import { State as CurrentNodeState } from './currentNode';
import { State as EditState } from './edit';
import { State as ExternalState } from './external';
import { State as FavoritesState } from './favorites';
import { State as FileImportState } from './fileImport';
import { State as RepositoryState } from './repository';
import { State as SearchState } from './search';
import { State as SettingsState } from './settings';
import { State as TreeStateState } from './treeState';

export interface RootState {
  currentEntry: CurrentEntryState,
  currentNode: CurrentNodeState,
  edit: EditState,
  external: ExternalState,
  favorites: FavoritesState,
  fileImport: FileImportState,
  repository: RepositoryState,
  search: SearchState,
  settings: SettingsState,
  treeState: TreeStateState,

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
