import * as React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import FocusingInput from './tools/FocusingInput';
import withTrans from '../utils/i18n/withTrans';
import Trans from '../utils/i18n/Trans';

export interface Props {
  name?: string,
  email?: string,
  local?: boolean,
  onChange: (name: string, email: string, local: boolean) => void
}

export default withTrans<Props>('.component.gitSignatureForm')(({ t, name = '', email = '', local = false, onChange }) => (<div>
  <p>
    <Trans id=".info" markdown/>
  </p>
  <FormGroup>
    <Label>{t('.field.name')}</Label>
    <FocusingInput focused value={name} onChange={ev => onChange(ev.target.value, email, local)} maxLength={100} />
  </FormGroup>
  <FormGroup>
    <Label>{t('.field.email')}</Label>
    <Input value={email} onChange={ev => onChange(name, ev.target.value, local)} maxLength={100} />
  </FormGroup>
  <FormGroup check>
    <Label check>
      <Input type="checkbox" checked={local} onChange={ev => onChange(name, email, ev.target.checked)} />
      {t('.field.local')}
    </Label>
  </FormGroup>
</div>));
