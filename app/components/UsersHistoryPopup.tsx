import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { formatDateTime } from '../utils/format';
import { GitCommitInfo } from '../utils/git';

export interface Props {
  open?: boolean,
  history: GitCommitInfo[],
  onClose: () => void
}

export default ({ open, history, onClose }: Props) => {
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>Known users history</ModalHeader>
    <ModalBody>
      <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
        <table className="table table-sm table-sticky">
          <thead>
          <tr>
            <th>Action</th>
            <th>Author</th>
            <th>Date</th>
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
      <Button autoFocus color="secondary" onClick={onClose}>Close</Button>
    </ModalFooter>
  </Modal>);
};
