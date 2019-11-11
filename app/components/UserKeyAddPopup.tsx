import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import {FormState} from '../actions/types/keys';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  open?: boolean,
  feedback?: string,
  valid?: boolean,
  privateKeyLoaded?: boolean
  value: FormState,
  onChange: (value: FormState) => void,
  onUsePrivateKey: () => void,
  onLoadKey: () => void,
  onConfirm: () => void,
  onClose: () => void
}

function focusOnRender(ref: HTMLInputElement) {
  if (ref) {
    setTimeout(() => { ref.focus(); ref.select(); });
  }
}

export default withTrans<Props>('component.userKeyAddPopup')(
  ({ t, open, feedback, valid = true, value, privateKeyLoaded,
     onChange, onUsePrivateKey, onLoadKey, onConfirm, onClose }) => (<Modal isOpen={open} toggle={onClose}>
  <ModalHeader toggle={onClose}>{t('.title')}</ModalHeader>
  <ModalBody>
    <Form id="editForm" onSubmit={onConfirm}>
      <FormGroup>
        <Label>{t('common.column.username')}</Label>
        <Input innerRef={value.username ? undefined : focusOnRender} value={value.username || ''}
               onChange={ev => onChange({ ...value, username: ev.target.value })} />
      </FormGroup>
      <FormGroup>
        <div className="pull-right">
          {privateKeyLoaded && <Button size="sm" onClick={onUsePrivateKey}>{t('.action.usePrivateKey')}</Button>}{' '}
          <Button size="sm" onClick={onLoadKey}>{t('.action.loadKey')}</Button>
        </div>
        <Label>{t('.label.publicKey')}</Label>
        <Input type="textarea" value={value.publicKey || ''} onChange={ev => onChange({ ...value, publicKey: ev.target.value })} style={{ height: 160 }} />
      </FormGroup>
      <FormGroup>
        <Label>{t('.label.keyName')}</Label>
        <Input value={value.keyName || ''} onChange={ev => onChange({ ...value, keyName: ev.target.value })} />
      </FormGroup>
    </Form>
  </ModalBody>
  <ModalFooter>
    <div className="text-danger" style={{ flexGrow: 1 }}>{feedback}</div>
    <Button type="submit" form="editForm" color="success" disabled={!valid}>{t('action.user.add')}</Button>{' '}
    <Button color="secondary" onClick={onClose}>{t('action.common.cancel')}</Button>
  </ModalFooter>
</Modal>));
