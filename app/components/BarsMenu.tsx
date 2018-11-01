import * as React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

export interface Props {
  size?: string,
  up?: boolean
  right?: boolean,
  children: any
}

export default ({ size, up = false, right = false, children }: Props) => (
  <UncontrolledDropdown tag="span" direction={up ? 'up' : 'down'} size={size}>
    <DropdownToggle>
      <i className="fa fa-bars" />
    </DropdownToggle>
    <DropdownMenu right={right}>
      {children}
    </DropdownMenu>
  </UncontrolledDropdown>
);
