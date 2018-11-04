import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import { EntryForm } from '../fileType/Components';

export interface Props {
  open?: boolean,
  isNew?: boolean,
  typeId: string,
  name?: string,
  parsedContent: any,
  formState: any,
  validationError?: string,
  authInfo?: string,
  onChangeName: (name: string) => void,
  onChange: (content: any) => void,
  onChangeState: (state: any) => void,
  onSave: () => void,
  onClose: () => void
}

export default ({ open, isNew, typeId, name, parsedContent, formState, validationError, authInfo, onChangeName, onChange, onChangeState, onSave, onClose }: Props) => {
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>
      {isNew ? 'Create new entry' : 'Edit entry'}
      {authInfo && <div style={{ fontWeight: 'normal', fontSize: 'medium' }}>{authInfo}</div>}
    </ModalHeader>
    <ModalBody>
      <Form id="editForm" onSubmit={onSave}>
        <EntryForm typeId={typeId} name={name || ''} onChangeName={onChangeName}
                   value={parsedContent} onChange={onChange} formState={formState} onChangeState={onChangeState} />
      </Form>
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{ flexGrow: 1 }}>{validationError}</div>
      <Button type="submit" form="editForm" color="primary">Save</Button>{' '}
      <Button form="editForm" color="secondary" onClick={onClose}>Cancel</Button>
    </ModalFooter>
  </Modal>);
};
