import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { ButtonGroup } from 'reactstrap';
import { Route } from 'react-router';
import Trans from '../containers/Trans';
import UserAccessTable from '../containers/UserAccessTable';
import UserKeyActionBar from '../containers/UserKeyActionBar';
import NoKeyAlert from '../containers/NoKeyAlert';
import UserKeyAddPopup from '../containers/UserKeyAddPopup';
import UserKeyTable from '../containers/UserKeyTable';
import UserPermissionTable from '../containers/UserPermissionTable';
import UsersHistoryButton from '../containers/UsersHistoryButton';
import UsersHistoryPopup from '../containers/UsersHistoryPopup';
import * as styles from './Users.scss';

export default (({}) => (<div className={`container ${styles.users}`}>
  <UserKeyAddPopup />
  <UsersHistoryPopup />
  <h1 className="my-4">Known users and keys</h1>

  <div className="mb-3">
    <Trans prop="test.key" markdown date={new Date()} user={<b>Username</b>}/>
    <Trans prop="test.key2"/><br/>
    <Trans prop="test.key3"/><br/>
    All users known to the current Stash repository are listed here.<br />
    That does not mean they are able to decrypt any content. Their username still needs to be explicitly
    granted access on one or more folders.
  </div>

  <NoKeyAlert />

  <div className={`row ${styles.actionBar}`}>
    <div className="col">
      <ButtonGroup>
        <NavLink to="/users" exact className="btn btn-outline-primary">Keys</NavLink>
        <NavLink to="/users/permissions" className="btn btn-outline-primary">Permissions</NavLink>
        <NavLink to="/users/access" className="btn btn-outline-primary">Folder access</NavLink>
      </ButtonGroup>
      <UsersHistoryButton color="link" title="History"><i className="fa fa-history"/></UsersHistoryButton>
    </div>
    <div className="col text-right">
      <UserKeyActionBar />
    </div>
  </div>

  <div className={styles.tableContainer}>
    <Route path="/users" exact component={UserKeyTable} />
    <Route path="/users/permissions" component={UserPermissionTable} />
    <Route path="/users/access" component={UserAccessTable} />
  </div>
</div>));
