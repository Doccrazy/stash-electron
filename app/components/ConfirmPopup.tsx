import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form } from 'reactstrap';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  open?: boolean;
  disabled?: boolean;
  title: string;
  feedback?: string;
  valid?: boolean;
  size?: string;
  children: any;
  onConfirm: () => void;
  onClose?: () => void;
}

function doFocus(ref: HTMLButtonElement) {
  if (ref) {
    setTimeout(() => ref.focus());
  }
}

const ConfirmPopup = withTrans<Props>()(({ t, open, disabled, title, feedback, valid = true, size, children, onConfirm, onClose }) => (
  <Modal isOpen={open} toggle={onClose} returnFocusAfterClose={false} size={size}>
    <ModalHeader toggle={onClose}>{title}</ModalHeader>
    <ModalBody>
      <Form id="editForm" onSubmit={onConfirm}>
        {children}
      </Form>
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{ flexGrow: 1 }}>
        {feedback}
      </div>
      <Button type="submit" form="editForm" innerRef={doFocus} color="primary" disabled={!valid || disabled}>
        {t('action.common.confirm')}
      </Button>{' '}
      {onClose && (
        <Button color="secondary" onClick={onClose} disabled={disabled}>
          {t('action.common.cancel')}
        </Button>
      )}
    </ModalFooter>
  </Modal>
));

export default ConfirmPopup;
