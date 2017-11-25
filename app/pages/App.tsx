import * as React from 'react';
import { Navbar, Nav, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import ReduxToastr from 'react-redux-toastr';
import GitStatus from '../containers/GitStatus';
import SearchField from '../containers/SearchField';
import LoginPopup from '../containers/LoginPopup';
import GitActionsPopup from '../containers/GitActionsPopup';
import WorkspaceLock from '../containers/WorkspaceLock';
import * as styles from './App.scss';

export interface Props {
  children: any
}

export default class App extends React.Component<Props, {}> {
  render() {
    return (
      <div className={styles.root}>
        <ReduxToastr timeOut={4000} preventDuplicates position="top-right" transitionIn="fadeIn" transitionOut="fadeOut" />
        <LoginPopup />
        <GitActionsPopup />
        <Navbar color="dark" className={`navbar-dark navbar-expand-md ${styles.nav}`}>
          <NavLink to="/" className="navbar-brand"><span className={styles.logo} /> Stash</NavLink>
          <Nav className="mr-auto" navbar>
            <NavItem>
              <NavLink to="/" exact className="nav-link">Browser</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/users" exact className="nav-link">Users</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/settings" exact className="nav-link">Settings</NavLink>
            </NavItem>
          </Nav>
          <SearchField className={`mr-3 ${styles.form}`} />
          <span className="navbar-text">
            <WorkspaceLock />
            <GitStatus />
          </span>
        </Navbar>
        {this.props.children}
      </div>
    );
  }
}
