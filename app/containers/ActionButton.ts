import { connect } from 'react-redux';
import { Button, ButtonProps } from 'reactstrap';
import { Dispatch } from '../actions/types';

export interface Props {
  actionCreator: () => any
}

export default connect(undefined, (dispatch: Dispatch, props: Props & ButtonProps) => ({
  onClick: (ev: any) => { dispatch(props.actionCreator()); }
}), (stateProps, dispatchProps, ownProps) => {
  const { actionCreator = null, ...props } = { ...ownProps, ...dispatchProps };
  return props;
})(Button);
