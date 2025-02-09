import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import { combineReducers } from 'redux';
import { reducer as toastr } from 'react-redux-toastr';
import { RootState } from './types';
import './gitHooks';

import authorizedUsers from './authorizedUsers';
import credentials from './credentials';
import currentEntry from './currentEntry';
import currentNode from './currentNode';
import edit from './edit';
import entryDetails from './entryDetails';
import external from './external';
import favorites from './favorites';
import fileExport from './fileExport';
import fileImport from './fileImport';
import git from './git';
import keys from './keys';
import nodeHistory from './nodeHistory';
import privateKey from './privateKey';
import './recentPrivateKeys';
import './recentRepositories';
import repository from './repository';
import search from './search';
import settings from './settings';
import share from './share';
import treeState from './treeState';
import usersHistory from './usersHistory';

export default (history?: History) =>
  combineReducers<RootState>({
    authorizedUsers,
    credentials,
    currentEntry,
    currentNode,
    edit,
    entryDetails,
    external,
    favorites,
    fileExport,
    fileImport,
    git,
    keys,
    nodeHistory,
    privateKey,
    repository,
    search,
    settings,
    share,
    treeState,
    usersHistory,

    router: history ? connectRouter(history) : (null as any),
    toastr
  });
