import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import { reducer as toastr } from 'react-redux-toastr';
import { RootState } from './types/index';
import './gitHooks';

import authorizedUsers from './authorizedUsers';
import credentials from './credentials';
import currentEntry from './currentEntry';
import currentNode from './currentNode';
import edit from './edit';
import entryDetails from './entryDetails';
import external from './external';
import favorites from './favorites';
import fileImport from './fileImport';
import git from './git';
import keys from './keys';
import privateKey from './privateKey';
import repository from './repository';
import search from './search';
import settings from './settings';
import treeState from './treeState';

const rootReducer = combineReducers<RootState>({
  authorizedUsers,
  credentials,
  currentEntry,
  currentNode,
  edit,
  entryDetails,
  external,
  favorites,
  fileImport,
  git,
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
