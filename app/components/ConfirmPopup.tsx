import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

export interface Props {
  open: boolean,
  title: string,
  children: any,
  onConfirm: () => void,
  onClose: () => void
}

export default ({ open, title, children, onConfirm, onClose }: Props) => (<Modal isOpen={open} toggle={onClose}>
  <ModalHeader toggle={onClose}>{title}</ModalHeader>
  <ModalBody>
    {children}
  </ModalBody>
  <ModalFooter>
    <Button getRef={btn => btn && setTimeout(() => btn.focus())} color="primary" onClick={onConfirm}>Confirm</Button>{' '}
    <Button color="secondary" onClick={onClose}>Cancel</Button>
  </ModalFooter>
</Modal>);
