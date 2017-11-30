import { connect } from 'react-redux';
import { Button } from 'reactstrap';

export interface Props {
  actionCreator: () => any
}

export default connect(undefined, (dispatch, props: Props & typeof Button.defaultProps) => ({
  onClick: (ev: any) => { dispatch(props.actionCreator()); }
}), (stateProps, dispatchProps, ownProps) => {
  const { action = null, ...props } = { ...ownProps, ...dispatchProps };
  return props;
})(Button);
