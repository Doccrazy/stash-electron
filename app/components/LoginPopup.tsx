import * as React from 'react';
import { FormGroup, Label, Input } from 'reactstrap';
import ConfirmPopup from '../components/ConfirmPopup';
import {FormState} from '../actions/types/credentials';
import FocusingInput from './tools/FocusingInput';

export interface Props {
  open?: boolean,
  askUsername?: boolean,
  title?: string,
  text?: string,
  error?: string,
  value: FormState,
  onChange: (value: FormState) => void,
  onConfirm: () => void,
  onClose: () => void
}

export default ({ open, askUsername, title, text, error, value, onChange, onConfirm, onClose}: Props) => (
  <ConfirmPopup open={!!open} title={title || 'Enter credentials'} valid={(!askUsername || !!value.username) && !!value.password} feedback={error} onConfirm={onConfirm} onClose={onClose}>
    {text || 'Please enter your credentials below.'}
    {askUsername && <FormGroup>
      <Label>Username</Label>
      <FocusingInput focused={!value.username} value={value.username || ''} onChange={ev => onChange({ ...value, username: ev.target.value })} />
    </FormGroup>}
    <FormGroup>
      <Label>Password</Label>
      <FocusingInput focused={!askUsername || !!value.username} type="password" value={value.password || ''} onChange={ev => onChange({ ...value, password: ev.target.value })} />
    </FormGroup>
    <FormGroup>
      <Label check>
        <Input type="checkbox" checked={!!value.savePassword} onChange={ev => onChange({ ...value, savePassword: ev.target.checked })} />
        Use system keystore to remember this password
      </Label>
    </FormGroup>
  </ConfirmPopup>
);
