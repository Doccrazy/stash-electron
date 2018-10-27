import { createStore, applyMiddleware, AnyAction } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import eventMiddleware from './eventMiddleware';
import rootReducer from '../actions/index';
import { RootState } from '../actions/types';

const history = createBrowserHistory({
  basename: window.location.pathname
});
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk as ThunkMiddleware<RootState, AnyAction, void>, eventMiddleware, router);

function configureStore(initialState?: any) {
  return createStore(connectRouter(history)(rootReducer), initialState, enhancer);
}

export default { configureStore, history };
