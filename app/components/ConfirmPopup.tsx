import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';

export interface Props {
  open?: boolean,
  disabled?: boolean,
  title: string,
  feedback?: string,
  valid?: boolean,
  children: any,
  onConfirm: () => void,
  onClose?: () => void
}

function doFocus(ref: HTMLButtonElement) {
  if (ref) {
    setTimeout(() => ref.focus());
  }
}

export default ({ open, disabled, title, feedback, valid = true, children, onConfirm, onClose }: Props) => (<Modal isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
  <ModalHeader toggle={onClose}>{title}</ModalHeader>
  <ModalBody>
    <Form id="editForm" onSubmit={onConfirm}>
      {children}
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className="text-danger" style={{ flexGrow: 1 }}>{feedback}</div>
    <Button type="submit" form="editForm" innerRef={doFocus} color="primary" disabled={!valid || disabled}>Confirm</Button>{' '}
    {onClose && <Button color="secondary" onClick={onClose} disabled={disabled}>Cancel</Button>}
  </ModalFooter>
</Modal>);
