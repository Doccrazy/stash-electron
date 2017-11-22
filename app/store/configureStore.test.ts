import { createStore, applyMiddleware, Middleware } from 'redux';
import thunk from 'redux-thunk';
import eventMiddleware from './eventMiddleware';
import rootReducer from '../actions/index';

const logger: Middleware = ({dispatch, getState}) => (next) => (action: any) => {
  console.info(action.type);
  return next(action);
};
const enhancer = applyMiddleware(thunk, eventMiddleware as any, logger);

function configureStore(initialState?: any) {
  return createStore(rootReducer, initialState, enhancer);
}

export default configureStore;
