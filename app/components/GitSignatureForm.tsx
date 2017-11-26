import * as React from 'react';
import { FormGroup, Input, Label } from 'reactstrap';
import FocusingInput from './tools/FocusingInput';

export interface Props {
  name?: string,
  email?: string,
  local?: boolean,
  onChange: (name: string, email: string, local: boolean) => void
}

export default ({ name = '', email = '', local = false, onChange }: Props) => (<div>
  <p>
    To commit your changes, a valid git signature must be configured.
  </p>
  <p>
    Your "signature" is what identifies your git commits to others.
    The name and email you enter here will be set as the author of your commits.
  </p>
  <FormGroup>
    <Label>Username or full name</Label>
    <FocusingInput focused value={name} onChange={ev => onChange(ev.target.value, email, local)} maxLength={100} />
  </FormGroup>
  <FormGroup>
    <Label>Email address</Label>
    <Input value={email} onChange={ev => onChange(name, ev.target.value, local)} maxLength={100} />
  </FormGroup>
  <FormGroup>
    <Label check>
      <Input type="checkbox" checked={local} onChange={ev => onChange(name, email, ev.target.checked)} />
      Save for local repository only
    </Label>
  </FormGroup>
</div>);
