import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import {FormState} from '../actions/types/keys';

export interface Props {
  open?: boolean,
  feedback?: string,
  valid?: boolean,
  value: FormState,
  onChange: (value: FormState) => void,
  onLoadKey: () => void,
  onConfirm: () => void,
  onClose: () => void
}

function focusOnRender(ref: HTMLInputElement) {
  if (ref) {
    setTimeout(() => { ref.focus(); ref.select(); });
  }
}

export default ({ open, feedback, valid = true, value, onChange, onLoadKey, onConfirm, onClose }: Props) => (<Modal isOpen={open} toggle={onClose}>
  <ModalHeader toggle={onClose}>Add user key</ModalHeader>
  <ModalBody>
    <Form id="editForm" onSubmit={onConfirm}>
      <FormGroup>
        <Label>Username</Label>
        <Input getRef={value.username ? undefined : focusOnRender} value={value.username || ''} onChange={ev => onChange({ ...value, username: ev.target.value })} />
      </FormGroup>
      <FormGroup>
        <Button size="sm" className="pull-right" onClick={onLoadKey}>Load file</Button>
        <Label>Public key (SSH / PEM / PPK)</Label>
        <Input type="textarea" value={value.publicKey || ''} onChange={ev => onChange({ ...value, publicKey: ev.target.value })} style={{ height: 160 }} />
      </FormGroup>
      <FormGroup>
        <Label>Key name (optional; used to identify the key later)</Label>
        <Input value={value.keyName || ''} onChange={ev => onChange({ ...value, keyName: ev.target.value })} />
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className="text-danger" style={{ flexGrow: 1 }}>{feedback}</div>
    <Button type="submit" form="editForm" color="success" disabled={!valid}>Add user</Button>{' '}
    <Button color="secondary" onClick={onClose}>Cancel</Button>
  </ModalFooter>
</Modal>);
