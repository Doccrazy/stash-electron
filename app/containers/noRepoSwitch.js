import React from 'react';
import { connect } from 'react-redux';

export default function (Component, Alternate) {
  const Switch = ({ hideComponent, ...props }) => (
    hideComponent ? <Alternate {...props} /> : <Component {...props} />
  );

  return connect(state => ({
    hideComponent: !state.repository.path
  }))(Switch);
}
