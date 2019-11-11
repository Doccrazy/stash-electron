import * as React from 'react';
import { Route } from 'react-router';
import { NavLink } from 'react-router-dom';
import { ButtonGroup } from 'reactstrap';
import NoKeyAlert from '../containers/NoKeyAlert';
import UserAccessTable from '../containers/UserAccessTable';
import UserKeyActionBar from '../containers/UserKeyActionBar';
import UserKeyAddPopup from '../containers/UserKeyAddPopup';
import UserKeyTable from '../containers/UserKeyTable';
import UserPermissionTable from '../containers/UserPermissionTable';
import UsersHistoryButton from '../containers/UsersHistoryButton';
import UsersHistoryPopup from '../containers/UsersHistoryPopup';
import Trans from '../utils/i18n/Trans';
import * as styles from './Users.scss';

export default (({}) => (<div className={`container ${styles.users}`}>
  <UserKeyAddPopup />
  <UsersHistoryPopup />
  <h1 className="my-4"><Trans id="page.users.title"/></h1>

  <div className="mb-3">
    <Trans id="page.users.info" markdown/>
  </div>

  <NoKeyAlert />

  <div className={`row ${styles.actionBar}`}>
    <div className="col-auto">
      <ButtonGroup>
        <NavLink to="/users" exact className="btn btn-outline-primary"><Trans id="nav.users.keys"/></NavLink>
        <NavLink to="/users/permissions" className="btn btn-outline-primary"><Trans id="nav.users.permissions"/></NavLink>
        <NavLink to="/users/access" className="btn btn-outline-primary"><Trans id="nav.users.folderAccess"/></NavLink>
      </ButtonGroup>
      <Trans>{t =>
        <UsersHistoryButton color="link" title={t('action.common.history')}><i className="fa fa-history"/></UsersHistoryButton>
      }</Trans>
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
