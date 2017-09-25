import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import { reducer as toastr } from 'react-redux-toastr';
import { RootState } from './types/index';

import credentials from './credentials';
import currentEntry from './currentEntry';
import currentNode from './currentNode';
import edit from './edit';
import external from './external';
import favorites from './favorites';
import fileImport from './fileImport';
import keys from './keys';
import privateKey from './privateKey';
import repository from './repository';
import search from './search';
import settings from './settings';
import treeState from './treeState';

const rootReducer = combineReducers<RootState>({
  credentials,
  currentEntry,
  currentNode,
  edit,
  external,
  favorites,
  fileImport,
  keys,
  privateKey,
  repository,
  search,
  settings,
  treeState,

  router,
  toastr
});

export default rootReducer;
