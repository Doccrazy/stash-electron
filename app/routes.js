/* eslint flowtype-errors/show-errors: 0 */
import React from 'react';
import { Switch, Route } from 'react-router';
import App from './pages/App';
import HomePage from './pages/Home';

export default () => (
  <App>
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/users" component={HomePage} />
      <Route path="/settings" component={HomePage} />
    </Switch>
  </App>
);
