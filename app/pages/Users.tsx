import * as React from 'react';
import UserKeyTable from '../containers/UserKeyTable';
import UserKeyActionBar from '../containers/UserKeyActionBar';
import NoKeyAlert from '../containers/NoKeyAlert';
import UserKeyAddPopup from '../containers/UserKeyAddPopup';

export default (({}) => (<div className="container">
  <UserKeyAddPopup />
  <h1 className="my-4">Known users and keys</h1>

  <p>
    All users known to the current Stash repository are listed here.<br />
    That does not mean they are able to decrypt any content. Their username still needs to be explicitly
    granted access on one or more folders.
  </p>

  <NoKeyAlert />

  <div className="text-right mb-3">
    <UserKeyActionBar />
  </div>

  <UserKeyTable />
</div>));
