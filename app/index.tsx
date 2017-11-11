import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import './utils/electronNoDrop';
import './utils/errorHandler';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import { load as loadSettings } from './actions/settings';
import installLinkHandler from './store/stashLinkHandler';
import registerHotkeys from './store/hotkeyHandlers';
import './utils/sshpk-key-deriv-patch.js';
import './app.global.scss';
import setupInactivityLock from './store/inactivityLock';

const store = configureStore();
setTimeout(() => {
  store.dispatch(loadSettings());
  installLinkHandler(store.dispatch);
  registerHotkeys(store.dispatch, store.getState);
  setupInactivityLock(store.dispatch, store.getState);
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
