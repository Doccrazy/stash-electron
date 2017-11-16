import * as React from 'react';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu } from 'reactstrap';

export interface Props {
  size?: string,
  up?: boolean
  right?: boolean,
  children: any
}

// React.createElement is required to work around missing props in reactstrap typings
export default ({ size, up = false, right = false, children }: Props) => (
  React.createElement(UncontrolledDropdown, { tag: 'span', dropup: up, size } as any,
    <DropdownToggle>
      <i className="fa fa-bars" />
    </DropdownToggle>,
    <DropdownMenu right={right}>
      {children}
    </DropdownMenu>
  )
);
