import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import './utils/electronNoDrop';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import { load as loadSettings } from './actions/settings';
import installLinkHandler from './store/stashLinkHandler';
import registerHotkeys from './store/hotkeyHandlers';
import './app.global.scss';

// TODO remove when reactstrap dropdowns are fixed
(global as any).jQuery = require('jquery');
(global as any).Popper = require('popper.js').default;
require('bootstrap/js/src/dropdown');

const store = configureStore();
setTimeout(() => {
  store.dispatch(loadSettings());
  installLinkHandler(store.dispatch);
  registerHotkeys(store.dispatch, store.getState);
});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if ((module as any).hot) {
  (module as any).hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root').default; // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
