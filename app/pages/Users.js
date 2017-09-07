import React from 'react';
import { Alert, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { changeSetting } from '../actions/settings';

const UsersPage = (({ loggedIn, onToggle }) => (<div className="container">
  <h1 className="my-4">Known users and keys</h1>

  <p>
    All users known to the current Stash repository are listed here.<br />
    That does not mean they are able to decrypt any content. Their username still needs to be explicitly
    granted access on one or more folders.
  </p>

  {!loggedIn && <Alert color="warning">
    You do not currently have access to the selected repository. You may either add yourself to the list of
    known users and ask someone else to authorize you, or load a different key.
  </Alert>}

  <div className="text-right mb-3">
    <Button onClick={onToggle}><i className="fa fa-key" /> {loggedIn ? 'Update my private key' : 'Load private key'}</Button>&nbsp;
    <Button><i className="fa fa-plus-circle" /> Add user</Button>&nbsp;
    <Button color="success"><i className="fa fa-save" /> Save changes</Button>
  </div>

  <table className="table table-sm">
    <thead>
      <tr>
        <th>Username</th>
        <th>Public key</th>
        <th>Key name</th>
        <th />
      </tr>
    </thead>
    <tbody>
      <tr className={loggedIn ? 'table-success' : ''}>
        <td>matthiasp</td>
        <td>AAAAB3NzaC1yc2EAAAABJQAAAIEAsaUBMPTQYbsdQw7kY4ixF4PTJW0...</td>
        <td>matthias.piepkorn@proxora.com</td>
        <td><a href="#" className="text-danger"><i className="fa fa-trash-o" /></a></td>
      </tr>
      <tr>
        <td>user_1</td>
        <td>AAAAB3NzaC1yc2EAAAADAQABAAABAQC68WnNksuJYljixZrDHgLlPaj...</td>
        <td>rsa-key-20040429</td>
        <td><a href="#" className="text-danger"><i className="fa fa-trash-o" /></a></td>
      </tr>
      <tr>
        <td>...</td>
        <td>...</td>
        <td>...</td>
        <td><a href="#" className="text-danger"><i className="fa fa-trash-o" /></a></td>
      </tr>
    </tbody>
  </table>
</div>));

export default connect(state => ({
  loggedIn: !state.settings.edited.foobar
}), dispatch => ({
  onToggle: () => dispatch((dispatch, getState) => dispatch(changeSetting('foobar', !getState().settings.edited.foobar)))
}))(UsersPage);
