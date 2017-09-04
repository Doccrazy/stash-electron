import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import './utils/electronNoDrop';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';
import { load as loadSettings } from './actions/settings';
import './app.global.scss';

// TODO remove when reactstrap dropdowns are fixed
global.jQuery = require('jquery');
global.Popper = require('popper.js').default;
require('bootstrap/js/src/dropdown');

const store = configureStore();

store.dispatch(loadSettings());

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const NextRoot = require('./containers/Root'); // eslint-disable-line global-require
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
