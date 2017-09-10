import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'react-router-redux';
import eventMiddleware from './eventMiddleware';
import rootReducer from '../actions/index';

const history = createBrowserHistory({
  basename: window.location.pathname
});
const router = routerMiddleware(history);
const enhancer = applyMiddleware(thunk, eventMiddleware as any, router);

function configureStore(initialState?: any) {
  return createStore(rootReducer, initialState, enhancer);
}

export default { configureStore, history };
