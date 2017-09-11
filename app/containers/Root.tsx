import * as React from 'react';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { History } from 'history';
import Routes from '../routes';
import '../fileType/registerComponents';

export interface Props {
  store: Store<any>,
  history: History
}

export default function Root({ store, history }: Props) {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </Provider>
  );
}
