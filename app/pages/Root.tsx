import * as React from 'react';
import { DragDropContextProvider  } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { hot } from 'react-hot-loader';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import Routes from './routes';
import '../fileType/default/register';
import '../fileType/password/register';

export interface Props {
  store: Store<any>,
  history: History
}

const Root = ({ store, history }: Props) => <Provider store={store}>
  <DragDropContextProvider backend={HTML5Backend}>
    <ConnectedRouter history={history}>
      <Routes />
    </ConnectedRouter>
  </DragDropContextProvider>
</Provider>;

export default hot(module)(Root);
