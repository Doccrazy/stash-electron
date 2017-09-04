import React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import { typeById } from '../fileType';

export default ({ open, isNew, typeId, name, parsedContent, formState, validationError, onChangeName, onChange, onChangeState, onSave, onClose }) => {
  const TypeForm = open && typeById(typeId).form;
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>{isNew ? 'Create new entry' : 'Edit entry'}</ModalHeader>
    <ModalBody>
      <Form id="editForm" onSubmit={onSave}>
        {TypeForm && <TypeForm name={name} onChangeName={onChangeName} value={parsedContent} onChange={onChange} formState={formState} onChangeState={onChangeState} />}
      </Form>
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{ flexGrow: 1 }}>{validationError}</div>
      <Button type="submit" form="editForm" color="primary">Save</Button>{' '}
      <Button form="editForm" color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>);
};
