import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Input, Label, ButtonGroup } from 'reactstrap';
import { STRENGTH_OPTIONS } from '../actions/privateKey';
import FocusingInput from './tools/FocusingInput';

export interface Props {
  open?: boolean,
  disabled?: boolean,
  passphrase?: string,
  passphraseRepeat?: string,
  strength?: number,
  valid?: boolean,
  onChangePassphrase: (value: string) => void,
  onChangePassphraseRepeat: (value: string) => void,
  onChangeStrength: (value: number) => void,
  onGenerate: () => void,
  onClose: () => void
}

export default ({ open, disabled, passphrase, passphraseRepeat, strength, valid = true,
                  onChangePassphrase, onChangePassphraseRepeat, onChangeStrength, onGenerate, onClose }: Props) => (
  <Modal isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>Generate private key</ModalHeader>
    <ModalBody>
      <p>This form allows you to generate a new RSA key for use within Stash.</p>
      <p>
        While optional, it is <b>highly recommended</b> to protect your key with a <b>passphrase</b>.
        This passphrase will prevent unauthorized access to your secrets, and will be required every time you open Stash.
      </p>
      <Form id="editForm" onSubmit={onGenerate}>
        <FormGroup>
          <Label>Strength</Label>
          <div>
            <ButtonGroup>
              {STRENGTH_OPTIONS.map(str =>
                <Button key={str} outline active={strength === str} onClick={() => onChangeStrength(str)}> {str} bits</Button>
              )}
            </ButtonGroup>
          </div>
        </FormGroup>
        <FormGroup>
          <Label>Passphrase</Label>
          <FocusingInput type="password" focused valid={valid ? undefined : false} disabled={disabled}
                         value={passphrase || ''} onChange={ev => onChangePassphrase(ev.target.value)} />
        </FormGroup>
        <FormGroup>
          <Label>Repeat passphrase</Label>
          <Input type="password" valid={valid ? undefined : false} disabled={disabled}
                 value={passphraseRepeat || ''} onChange={ev => onChangePassphraseRepeat(ev.target.value)} />
        </FormGroup>
      </Form>
    </ModalBody>
    <ModalFooter>
      {!passphrase && <div style={{ flexGrow: 1 }}><i className="fa fa-warning text-warning" /> Passphrase is empty</div>}
      <Button type="submit" form="editForm" color="primary" disabled={!valid || disabled}>
        {disabled && <i className="fa fa-spinner fa-pulse" />}{' '}
        Generate &amp; Export
      </Button>{' '}
      <Button color="secondary" onClick={onClose} disabled={disabled}>Cancel</Button>
    </ModalFooter>
  </Modal>
);
