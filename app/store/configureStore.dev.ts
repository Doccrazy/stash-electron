import { createStore, applyMiddleware, compose, AnyAction, StoreEnhancer } from 'redux';
import thunk, { ThunkDispatch } from 'redux-thunk';
import { createHashHistory } from 'history';
import { routerMiddleware, connectRouter, routerActions } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { RootState } from '../actions/types';
import eventMiddleware from './eventMiddleware';
import rootReducer from '../actions/index';

const history = createHashHistory();

const configureStore = (initialState?: any) => {
  // Redux Configuration
  const middleware: any[] = [];
  const enhancers = [];

  // Thunk Middleware
  middleware.push(thunk);

  middleware.push(eventMiddleware);

  // Logging Middleware
  const logger = createLogger({
    level: 'info',
    collapsed: true
  });
  middleware.push(logger);

  // Router Middleware
  const router = routerMiddleware(history);
  middleware.push(router);

  // Redux DevTools Configuration
  const actionCreators = {
    ...routerActions
  };
  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  /* eslint-disable no-underscore-dangle */
  const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Options: http://zalmoxisus.github.io/redux-devtools-extension/API/Arguments.html
      actionCreators
    })
    : compose;
  /* eslint-enable no-underscore-dangle */

  // Apply Middleware & Compose Enhancers
  enhancers.push(applyMiddleware(...middleware));
  const enhancer = composeEnhancers(...enhancers) as StoreEnhancer<{dispatch: ThunkDispatch<RootState, void, AnyAction>}>;

  // Create Store
  const store = createStore(connectRouter(history)(rootReducer), initialState, enhancer);

  if ((module as any).hot) {
    (module as any).hot.accept('../actions', () =>
      store.replaceReducer(require('../actions/index')) // eslint-disable-line global-require
    );
  }

  return store;
};

export default { configureStore, history };
