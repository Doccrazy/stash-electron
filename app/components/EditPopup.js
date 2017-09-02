import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { typeById } from '../fileType';

export default ({ open, isNew, typeId, name, parsedContent, formState, validationError, onChangeName, onChange, onChangeState, onSave, onClose }) => {
  const TypeForm = typeId && typeById(typeId).form;
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>{isNew ? 'Create new entry' : 'Edit entry'}</ModalHeader>
    <ModalBody>
      {TypeForm && <TypeForm name={name} onChangeName={onChangeName} value={parsedContent} onChange={onChange} formState={formState} onChangeState={onChangeState} />}
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{ flexGrow: 1 }}>{validationError}</div>
      <Button color="primary" onClick={onSave}>Save</Button>{' '}
      <Button color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>);
};
