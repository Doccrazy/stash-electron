import * as React from 'react';
import { DragDropContextProvider  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
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
      <DragDropContextProvider backend={HTML5Backend}>
        <ConnectedRouter history={history}>
          <Routes />
        </ConnectedRouter>
      </DragDropContextProvider>
    </Provider>
  );
}
