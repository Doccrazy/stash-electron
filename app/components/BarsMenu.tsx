import * as React from 'react';

export interface Props {
  size?: string,
  up?: boolean
  right?: boolean,
  children: any
}

export default ({ size, up = false, right = false, children }: Props) => (
  <div className={`dropdown ${up ? 'dropup' : ''}`} style={{ display: 'inline-block' }}>
    <button type="button" className={`btn btn-secondary ${size ? `btn-${size}` : ''}`} data-toggle="dropdown">
      <i className="fa fa-bars" />
    </button>
    <div className={`dropdown-menu ${right ? 'dropdown-menu-right' : ''}`}>
      {children}
    </div>
  </div>
);
