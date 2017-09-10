import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { browseForFolder } from '../actions/settings';
import {SettingsKeys} from '../actions/types/settings';

export interface Props {
  field: SettingsKeys,
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
