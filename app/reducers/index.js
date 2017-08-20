// @flow
import { combineReducers } from 'redux';
import { routerReducer as router } from 'react-router-redux';
import counter from './counter';
import repository from './repository';
import settings from './settings';

const rootReducer = combineReducers({
  counter,
  repository,
  settings,
  router,
});

export default rootReducer;
