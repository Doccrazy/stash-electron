import * as React from 'react';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { changeSetting } from '../actions/settings';

export interface Props {
  field: string
}

export default connect((state, props: Props) => ({
  value: state.settings.edited[props.field]
}), (dispatch, props) => ({
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => dispatch(changeSetting(props.field, ev.target.value))
}), (stateProps, dispatchProps, ownProps): any => {
  const props = Object.assign({}, ownProps, stateProps, dispatchProps);
  delete props.field;
  return props;
})(Input);
