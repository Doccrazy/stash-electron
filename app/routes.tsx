import * as React from 'react';
import { Switch, Route } from 'react-router';
import App from './pages/App';
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';
import UsersPage from './pages/Users';
import NoRepository from './pages/NoRepository';
import noRepoSwitch from './containers/noRepoSwitch';

const HomeWithOverlay = noRepoSwitch(HomePage, NoRepository);
const UsersWithOverlay = noRepoSwitch(UsersPage, NoRepository);

export default () => (
  <App>
    <Switch>
      <Route path="/settings" component={SettingsPage} />
      <Route path="/users" component={UsersWithOverlay} />
      <Route component={HomeWithOverlay} />
    </Switch>
  </App>
);
