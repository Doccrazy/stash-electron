import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { is, fromJS } from 'immutable';
import { save as saveSettings } from '../actions/settings';
import {RootState} from '../actions/types/index';

export default connect((state: RootState): { disabled?: boolean } => ({
  disabled: is(fromJS(state.settings.current), fromJS(state.settings.edited))
}), (dispatch): { onClick?: React.MouseEventHandler<any> } => ({
  onClick: () => dispatch(saveSettings())
}))(Button);
