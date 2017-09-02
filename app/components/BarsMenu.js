import React from 'react';

export default ({ size, up = false, right = false, children }) => (
  <div className={`dropdown ${up ? 'dropup' : ''}`} style={{ display: 'inline-block' }}>
    <button className={`btn btn-secondary ${size ? `btn-${size}` : ''}`} data-toggle="dropdown">
      <i className="fa fa-bars" />
    </button>
    <div className={`dropdown-menu ${right ? 'dropdown-menu-right' : ''}`}>
      {children}
    </div>
  </div>
);
