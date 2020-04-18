import * as React from 'react';
import { render } from 'react-dom';
import * as crypto from 'crypto';
import './utils/electronNoDrop';
import './utils/errorHandler';
import './initLocales';
import { connectTranslateFunction } from './utils/i18n/redux';
import Root from './pages/Root';
import { configureStore, history } from './store/configureStore';
import { load as loadSettings } from './actions/settings';
import installLinkHandler from './store/stashLinkHandler';
import registerHotkeys from './store/hotkeyHandlers';
import './app.global.scss';
import setupInactivityLock from './store/inactivityLock';
import setupGitPolling from './store/gitPolling';
import installQuitHook from './store/quitHook';

const store = configureStore();
setTimeout(() => {
  store.dispatch(loadSettings());
  connectTranslateFunction(store.getState, (state) => state.settings.current.locale);
  installLinkHandler(store.dispatch);
  registerHotkeys(store.dispatch, store.getState);
  setupInactivityLock(store.dispatch, store.getState);
  setupGitPolling(store.dispatch, store.getState);
  if (process.env.NODE_ENV === 'production') {
    installQuitHook(store.dispatch, store.getState);
  }
});

setTimeout(() => {
  // asynchronously initialize the OpenSSL library (takes ~1s)
  // https://github.com/electron/electron/issues/2073
  crypto.randomBytes(1, () => {
    // done
  });
}, 1000);

render(<Root store={store} history={history} />, document.getElementById('root'));
