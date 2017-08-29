// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import { reducer as toastr } from 'react-redux-toastr';
import currentEntry from './currentEntry';
import edit from './edit';
import favorites from './favorites';
import repository from './repository';
import settings from './settings';

const rootReducer = combineReducers({
  currentEntry,
  edit,
  favorites,
  repository,
  settings,

  router,
  toastr
});

export default rootReducer;
