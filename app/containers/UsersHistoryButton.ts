import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { Dispatch } from '../actions/types';
import { open } from '../actions/usersHistory';

export default connect(null, (dispatch: Dispatch): { onClick?: React.MouseEventHandler<any> } => ({
  onClick: () => dispatch(open())
}))(Button);
