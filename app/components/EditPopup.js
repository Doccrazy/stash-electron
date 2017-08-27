import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import typeFor from '../fileType';

export default ({ entry, parsedContent, onChange, onSave, onClose }) => {
  const TypeForm = entry && typeFor(entry).form;
  return (<Modal size="lg" isOpen={!!entry} toggle={onClose}>
    <ModalHeader toggle={onClose}>Edit entry</ModalHeader>
    <ModalBody>
      {TypeForm && <TypeForm value={parsedContent} onChange={onChange} />}
    </ModalBody>
    <ModalFooter>
      <Button color="primary" onClick={onSave}>Save</Button>{' '}
      <Button color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>);
};
