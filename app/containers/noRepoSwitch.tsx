import * as React from 'react';
import { connect } from 'react-redux';

interface SwitchProps {
  hideComponent: boolean,
  [propName: string]: any;
}

export default function(Component: React.ComponentType<any>, Alternate: React.ComponentType<any>): React.ComponentType<any> {
  const Switch = ({ hideComponent, ...props }: SwitchProps) => (
    hideComponent ? <Alternate {...props} /> : <Component {...props} />
  );

  return connect(state => ({
    hideComponent: !state.repository.path || state.repository.loading,
    loading: state.repository.loading
  }))(Switch);
}
