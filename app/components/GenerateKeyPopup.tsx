import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Input, Label, ButtonGroup } from 'reactstrap';
import { STRENGTH_OPTIONS } from '../actions/privateKey';
import FocusingInput from './tools/FocusingInput';
import withTrans from '../utils/i18n/withTrans';
import Trans from '../utils/i18n/Trans';

export interface Props {
  open?: boolean;
  disabled?: boolean;
  passphrase?: string;
  passphraseRepeat?: string;
  strength?: number;
  valid?: boolean;
  onChangePassphrase: (value: string) => void;
  onChangePassphraseRepeat: (value: string) => void;
  onChangeStrength: (value: number) => void;
  onGenerate: () => void;
  onClose: () => void;
}

export default withTrans<Props>('component.generateKeyPopup')(
  ({
    t,
    open,
    disabled,
    passphrase,
    passphraseRepeat,
    strength,
    valid = true,
    onChangePassphrase,
    onChangePassphraseRepeat,
    onChangeStrength,
    onGenerate,
    onClose
  }) => (
    <Modal isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
      <ModalHeader toggle={onClose}>{t('.title')}</ModalHeader>
      <ModalBody>
        <div className="mb-3">
          <Trans id=".info" markdown />
        </div>
        <Form id="editForm" onSubmit={onGenerate}>
          <FormGroup>
            <Label>{t('.strength')}</Label>
            <div>
              <ButtonGroup>
                {STRENGTH_OPTIONS.map((str) => (
                  <Button key={str} outline active={strength === str} onClick={() => onChangeStrength(str)}>
                    {t('.strengthBits', { bits: str })}
                  </Button>
                ))}
              </ButtonGroup>
            </div>
          </FormGroup>
          <FormGroup>
            <Label>{t('.passphrase')}</Label>
            <FocusingInput
              type="password"
              focused
              valid={valid ? undefined : false}
              disabled={disabled}
              value={passphrase || ''}
              onChange={(ev) => onChangePassphrase(ev.target.value)}
            />
          </FormGroup>
          <FormGroup>
            <Label>{t('.repeatPassphrase')}</Label>
            <Input
              type="password"
              valid={valid ? undefined : false}
              disabled={disabled}
              value={passphraseRepeat || ''}
              onChange={(ev) => onChangePassphraseRepeat(ev.target.value)}
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        {!passphrase && (
          <div style={{ flexGrow: 1 }}>
            <i className="fa fa-warning text-warning" /> {t('.error.emptyPassphrase')}
          </div>
        )}
        <Button type="submit" form="editForm" color="primary" disabled={!valid || disabled}>
          {disabled && <i className="fa fa-spinner fa-pulse" />} {t('.action.generate')}
        </Button>{' '}
        <Button color="secondary" onClick={onClose} disabled={disabled}>
          {t('action.common.cancel')}
        </Button>
      </ModalFooter>
    </Modal>
  )
);
