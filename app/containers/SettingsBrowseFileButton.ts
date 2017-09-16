import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { browseForFile } from '../actions/settings';
import {SettingsKeys} from '../actions/types/settings';

export interface Props {
  field: SettingsKeys,
  title: string,
  filters?: { extensions: string[], name: string }[]
}

export default connect(() => ({
}), (dispatch, props: Props) => ({
  onClick: () => dispatch(browseForFile(props.field, props.title, props.filters))
}), (stateProps, dispatchProps, ownProps): any => {
  const props = Object.assign({}, ownProps, stateProps, dispatchProps);
  delete props.field;
  delete props.title;
  delete props.filters;
  return props;
})(Button);
