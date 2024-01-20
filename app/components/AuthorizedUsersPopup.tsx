import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import { Set } from 'immutable';
import cx from 'classnames';
import Node from '../domain/Node';
import withTrans from '../utils/i18n/withTrans';
import styles from './AuthorizedUsersPopup.scss';

export interface Props {
  open?: boolean;
  nodeName?: string;
  inherited?: boolean;
  editable?: boolean;
  modified?: boolean;
  currentUser?: string;
  users?: Set<string>;
  allUsers: Set<string>;
  authParent?: Node;
  onChange: (users: Set<string>) => void;
  onToggleInherit: () => void;
  onSave: () => void;
  onHistory: () => void;
  onClose: () => void;
}

// may only reset to parent if user is authorized on it
function mayInherit(authParent?: Node, inherited?: boolean, currentUser?: string) {
  return inherited || (authParent && authParent.authorizedUsers && currentUser && authParent.authorizedUsers.includes(currentUser));
}

function mayToggle(username: string, currentUser: string | undefined, users: Set<string>) {
  return username !== currentUser || (currentUser && !users.includes(currentUser));
}

export default withTrans<Props>('component.authorizedUsersPopup')(({
  t,
  open,
  nodeName = '',
  inherited,
  editable,
  modified,
  currentUser,
  users = Set(),
  allUsers,
  authParent,
  onChange,
  onToggleInherit,
  onSave,
  onHistory,
  onClose
}) => {
  const resolvedUsers = ((inherited && authParent ? authParent.authorizedUsers : users) || Set()).sort() as Set<string>;
  return (
    <Modal size="lg" isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
      <ModalHeader toggle={onClose}>{t('.title', { nodeName })}</ModalHeader>
      <ModalBody>
        <span className="selectable">
          {t('.status', { inheritedFrom: inherited && authParent ? authParent.name : '_NONE', users: resolvedUsers.join(', ') })}
        </span>
        <Form id="editForm" onSubmit={onSave}>
          <div className={styles.usersTable}>
            {editable &&
              !inherited &&
              allUsers.sort().map((username: string) => (
                <div
                  key={username}
                  className={cx(
                    mayToggle(username, currentUser, users) && 'clickable',
                    users.includes(username) ? styles.selected : styles.unselected
                  )}
                  onClick={() =>
                    mayToggle(username, currentUser, users) &&
                    onChange(users.includes(username) ? users.delete(username) : users.add(username))
                  }
                >
                  {username}
                </div>
              ))}
          </div>
          {editable &&
            (mayInherit(authParent, inherited, currentUser) ? (
              <Button onClick={onToggleInherit}>{inherited ? t('.button.override') : t('.button.resetToParent')}</Button>
            ) : (
              <i>{t('.resetWarning')}</i>
            ))}
        </Form>
        {editable && (
          <div className="mt-3">
            <i className="fa fa-warning text-warning" /> {t('.generalWarning')}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <div style={{ flexGrow: 1 }}>
          <Button color="link" title={t('action.common.history')} onClick={onHistory}>
            <i className="fa fa-history" />
          </Button>
        </div>
        {editable && (
          <Button type="submit" form="editForm" color="primary" disabled={!modified}>
            {t('action.common.save')}
          </Button>
        )}{' '}
        <Button autoFocus form="editForm" color="secondary" onClick={onClose}>
          {editable ? t('action.common.cancel') : t('action.common.close')}
        </Button>
      </ModalFooter>
    </Modal>
  );
});
