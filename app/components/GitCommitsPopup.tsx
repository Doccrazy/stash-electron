import * as React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import { GitCommitInfo } from '../utils/git';
import GitCommitsTable from './GitCommitsTable';

export interface Props {
  open?: boolean
  title: string
  commits: GitCommitInfo[]
  onClose: () => void
}

export default ({ open, title, commits, onClose }: Props) => {
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>{title}</ModalHeader>
    <ModalBody>
      <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
        <GitCommitsTable commits={commits}/>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button autoFocus color="secondary" onClick={onClose}>Close</Button>
    </ModalFooter>
  </Modal>);
};
