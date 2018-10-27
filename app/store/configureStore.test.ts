import { createStore, applyMiddleware, Middleware, AnyAction } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { RootState } from '../actions/types';
import eventMiddleware from './eventMiddleware';
import rootReducer from '../actions/index';

const logger: Middleware = ({dispatch, getState}) => (next) => (action: any) => {
  console.info(action.type);
  return next(action);
};
const enhancer = applyMiddleware(thunk as ThunkMiddleware<RootState, AnyAction, void>, eventMiddleware, logger);

function configureStore(initialState?: any) {
  return createStore(rootReducer, initialState, enhancer);
}

export default configureStore;
