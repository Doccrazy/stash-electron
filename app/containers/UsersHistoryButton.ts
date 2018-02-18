import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { open } from '../actions/usersHistory';

export default connect(null, (dispatch): { onClick?: React.MouseEventHandler<any> } => ({
  onClick: () => dispatch(open())
}))(Button);
