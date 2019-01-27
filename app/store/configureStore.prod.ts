import { createStore, applyMiddleware, AnyAction } from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import eventMiddleware from './eventMiddleware';
import createRootReducer from '../actions/index';
import { RootState } from '../actions/types';

const history = createBrowserHistory({
  basename: window.location.pathname
});
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk as ThunkMiddleware<RootState, AnyAction, void>, eventMiddleware, router);

function configureStore(initialState?: any) {
  return createStore(createRootReducer(history), initialState, enhancer);
}

export default { configureStore, history };
