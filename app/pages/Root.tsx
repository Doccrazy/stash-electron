import * as React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Store } from 'redux';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { History } from 'history';
import Routes from './routes';
import '../fileType/default/register';
import '../fileType/password/register';

export interface Props {
  store: Store<any>;
  history: History;
}

const Root = ({ store, history }: Props) => (
  <Provider store={store}>
    <DndProvider backend={HTML5Backend}>
      <ConnectedRouter history={history}>
        <Routes />
      </ConnectedRouter>
    </DndProvider>
  </Provider>
);

export default Root;
