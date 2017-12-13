import * as React from 'react';
import { Switch, Route } from 'react-router';
import App from './App';
import HomePage from './Home';
import SettingsPage from './Settings';
import UsersPage from './Users';
import WelcomePage from './Welcome';
import ChangelogPage from './Changelog';
import NoRepository from './NoRepository';
import noRepoSwitch from '../containers/noRepoSwitch';

const HomeWithOverlay = noRepoSwitch(HomePage, NoRepository);
const UsersWithOverlay = noRepoSwitch(UsersPage, NoRepository);

export default () => (
  <App>
    <Switch>
      <Route path="/settings" component={SettingsPage} />
      <Route path="/users" component={UsersWithOverlay} />
      <Route path="/welcome" children={WelcomePage} />
      <Route path="/changelog" children={ChangelogPage} />
      <Route component={HomeWithOverlay} />
    </Switch>
  </App>
);
