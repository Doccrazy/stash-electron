import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { changeSetting } from '../actions/settings';

export default connect((state, props) => ({
  value: state.settings.edited[props.field]
}), (dispatch, props) => ({
  onChange: ev => dispatch(changeSetting(props.field, ev.target.value))
}), (stateProps, dispatchProps, ownProps) => {
  const props = Object.assign({}, ownProps, stateProps, dispatchProps);
  delete props.field;
  return props;
})(Input);
