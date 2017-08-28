import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import typeFor from '../fileType';

export default ({ entry, parsedContent, formState, validationError, onChange, onChangeState, onSave, onClose }) => {
  const TypeForm = entry && typeFor(entry).form;
  return (<Modal size="lg" isOpen={!!entry} toggle={onClose}>
    <ModalHeader toggle={onClose}>Edit entry</ModalHeader>
    <ModalBody>
      {TypeForm && <TypeForm value={parsedContent} onChange={onChange} formState={formState} onChangeState={onChangeState} />}
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{ flexGrow: 1 }}>{validationError}</div>
      <Button color="primary" onClick={onSave}>Save</Button>{' '}
      <Button color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>);
};
