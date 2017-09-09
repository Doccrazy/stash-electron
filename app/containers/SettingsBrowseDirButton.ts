import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { browseForFolder } from '../actions/settings';

export interface Props {
  field: string,
  title: string
}

export default connect(() => ({
}), (dispatch, props: Props) => ({
  onClick: () => dispatch(browseForFolder(props.field, props.title))
}), (stateProps, dispatchProps, ownProps): any => {
  const props = Object.assign({}, ownProps, stateProps, dispatchProps);
  delete props.field;
  delete props.title;
  return props;
})(Button);
