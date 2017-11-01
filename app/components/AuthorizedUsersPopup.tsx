import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import {Set} from 'immutable';
import * as cx from 'classnames';
import Node from '../domain/Node';
import * as styles from './AuthorizedUsersPopup.scss';

export interface Props {
  open?: boolean,
  nodeName?: string,
  inherited?: boolean,
  editable?: boolean,
  modified?: boolean,
  currentUser?: string,
  users?: Set<string>,
  allUsers: Set<string>,
  authParent?: Node,
  validationError?: string,
  onChange: (users: Set<string>) => void,
  onToggleInherit: () => void,
  onSave: () => void,
  onClose: () => void
}

// may only reset to parent if user is authorized on it
function mayInherit(authParent?: Node, inherited?: boolean, currentUser?: string) {
  return inherited || (authParent && authParent.authorizedUsers && currentUser && authParent.authorizedUsers.includes(currentUser));
}

function mayToggle(username: string, currentUser: string | undefined, users: Set<string>) {
  return username !== currentUser || (currentUser && !users.includes(currentUser));
}

export default ({ open, nodeName, inherited, editable, modified, currentUser, users = Set(), allUsers, authParent, validationError, onChange, onToggleInherit, onSave, onClose }: Props) => {
  const resolvedUsers = ((inherited && authParent ? authParent.authorizedUsers : users) || Set()).sort() as Set<string>;
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>Permissions for {nodeName}</ModalHeader>
    <ModalBody>
      Authorized users{inherited && authParent && ` (inherited from ${authParent.name})`}: {resolvedUsers.join(', ')}
      <Form id="editForm" onSubmit={onSave}>
        <div className={styles.usersTable}>
          {editable && !inherited && allUsers.sort().map((username: string) => (
            <div
              key={username}
              className={cx(mayToggle(username, currentUser, users) && 'clickable', users.includes(username) ? styles.selected : styles.unselected)}
              onClick={() => mayToggle(username, currentUser, users) && onChange(users.includes(username) ? users.delete(username) : users.add(username))}
            >
              {username}
            </div>
          ))}
        </div>
        {editable && (mayInherit(authParent, inherited, currentUser)
          ? <Button onClick={onToggleInherit}>{inherited ? 'Override' : 'Reset to parent'}</Button>
          : <i>Reset to parent not possible: unauthorized.</i>
        )}
      </Form>
      {editable && <div className="mt-3">
        <i className="fa fa-warning text-warning" /> Revoking a permission usually requires changing all passwords. Be mindful who you grant access to.
      </div>}
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{ flexGrow: 1 }}>{validationError}</div>
      {editable && <Button type="submit" form="editForm" color="primary" disabled={!modified}>Save</Button>}{' '}
      <Button form="editForm" color="secondary" onClick={onClose}>{editable ? 'Cancel' : 'Close'}</Button>
    </ModalFooter>
  </Modal>);
};
