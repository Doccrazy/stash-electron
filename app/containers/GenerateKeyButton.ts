import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { openGenerate } from '../actions/privateKey';

export default connect(undefined, (dispatch, props: typeof Button.defaultProps) => ({
  onClick: (ev: any) => { dispatch(openGenerate()); }
}), (stateProps, dispatchProps, ownProps) => ({
  ...ownProps, ...dispatchProps
}))(Button);
