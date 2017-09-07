/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './pages/App';
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';
import UsersPage from './pages/Users';
import NoRepository from './pages/NoRepository';
import noRepoSwitch from './containers/noRepoSwitch';

export default () => (
  <App>
    <Switch>
      <Route path="/settings" component={SettingsPage} />
      <Route path="/users" component={noRepoSwitch(UsersPage, NoRepository)} />
      <Route path="/" component={noRepoSwitch(HomePage, NoRepository)} />
    </Switch>
  </App>
);
