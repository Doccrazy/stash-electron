import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { formatDateTime } from '../utils/format';
import { GitCommitInfo } from '../utils/git';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  open?: boolean,
  history: GitCommitInfo[],
  onClose: () => void
}

export default withTrans<Props>('component.usersHistoryPopup')(({ t, open, history, onClose }) => {
  return (<Modal size="lg" isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
    <ModalHeader toggle={onClose}>{t('.title')}</ModalHeader>
    <ModalBody>
      <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
        <table className="table table-sm table-sticky">
          <thead>
          <tr>
            <th>{t('common.column.action')}</th>
            <th>{t('common.column.author')}</th>
            <th>{t('common.column.date')}</th>
          </tr>
          </thead>
          <tbody>
          {history.map(commit => <tr key={commit.hash}>
            <td>{commit.message}</td>
            <td title={commit.authorEmail}>{commit.authorName}</td>
            <td>{formatDateTime(commit.date)}</td>
          </tr>)}
          </tbody>
        </table>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button autoFocus color="secondary" onClick={onClose}>{t('action.common.close')}</Button>
    </ModalFooter>
  </Modal>);
});
