/* tslint:disable */
import * as React from 'react';
import { UncontrolledDropdownProps } from 'reactstrap/lib/Dropdown';
import { FadeProps } from 'reactstrap/lib/Fade';

declare module 'reactstrap/lib/Dropdown' {
  interface UncontrolledDropdownProps {
    dropup?: boolean;
    size?: string;
    tag?: React.ReactType;
  }
}

declare module 'reactstrap/lib/Fade' {
  interface FadeProps {
    mountOnEnter?: boolean,
    unmountOnExit?: boolean,
    timeout?: number | { enter?: number, exit?: number }
  }
}
