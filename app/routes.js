/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './pages/App';
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';
import UsersPage from './pages/Users';

export default () => (
  <App>
    <Switch>
      <Route path="/settings" component={SettingsPage} />
      <Route path="/users" component={UsersPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  </App>
);
