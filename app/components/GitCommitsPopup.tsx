import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { GitCommitInfo } from '../utils/git';
import GitCommitsTable from './GitCommitsTable';
import Trans from '../utils/i18n/Trans';

export interface Props {
  open?: boolean;
  title: string;
  commits: GitCommitInfo[];
  onClose: () => void;
}

const GitCommitsPopup = ({ open, title, commits, onClose }: Props) => {
  return (
    <Modal size="lg" isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
      <ModalHeader toggle={onClose}>{title}</ModalHeader>
      <ModalBody>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <GitCommitsTable commits={commits} />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button autoFocus color="secondary" onClick={onClose}>
          <Trans id="action.common.close" />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default GitCommitsPopup;
