import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { browseForFolder } from '../actions/settings';

export default connect(() => ({
}), (dispatch, props) => ({
  onClick: () => dispatch(browseForFolder(props.field, props.title))
}), (stateProps, dispatchProps, ownProps) => {
  const props = Object.assign({}, ownProps, stateProps, dispatchProps);
  delete props.field;
  delete props.title;
  return props;
})(Button);
