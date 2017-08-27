// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import currentEntry from './currentEntry';
import edit from './edit';
import favorites from './favorites';
import repository from './repository';
import settings from './settings';

const rootReducer = combineReducers({
  counter,
  currentEntry,
  edit,
  favorites,
  repository,
  settings,
  router,
});

export default rootReducer;
