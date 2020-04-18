import * as React from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import ConfirmPopup from '../components/ConfirmPopup';
import { FormState } from '../actions/types/credentials';
import FocusingInput from './tools/FocusingInput';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  open?: boolean;
  working?: boolean;
  askUsername?: boolean;
  title?: string;
  text?: string;
  error?: string;
  value: FormState;
  onChange: (value: FormState) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default withTrans<Props>('component.loginPopup')(
  ({ t, open, working, askUsername, title, text, error, value, onChange, onConfirm, onClose }) => (
    <ConfirmPopup
      open={!!open}
      disabled={working}
      title={title || t('.title')}
      valid={(!askUsername || !!value.username) && !!value.password}
      feedback={error}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      {text || t('.info')}
      {askUsername && (
        <FormGroup>
          <Label>{t('.field.username')}</Label>
          <FocusingInput
            focused={!value.username}
            disabled={working}
            value={value.username || ''}
            onChange={(ev) => onChange({ ...value, username: ev.target.value })}
          />
        </FormGroup>
      )}
      <FormGroup>
        <Label>{t('.field.password')}</Label>
        <FocusingInput
          focused={!askUsername || !!value.username}
          disabled={working}
          type="password"
          value={value.password || ''}
          onChange={(ev) => onChange({ ...value, password: ev.target.value })}
        />
      </FormGroup>
      <FormGroup check>
        <Label check>
          <Input
            type="checkbox"
            checked={!!value.savePassword}
            onChange={(ev) => onChange({ ...value, savePassword: ev.target.checked })}
          />
          {t('.field.remember')}
        </Label>
      </FormGroup>
    </ConfirmPopup>
  )
);
