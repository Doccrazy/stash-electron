import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { typeById } from '../fileType';

export default ({ open, title, children, onConfirm, onClose }) => {
  return (<Modal isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>{title}</ModalHeader>
    <ModalBody>
      {children}
    </ModalBody>
    <ModalFooter>
      <Button getRef={btn => btn && setTimeout(() => btn.focus())} color="primary" onClick={onConfirm}>Confirm</Button>{' '}
      <Button color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>);
};
