import * as React from 'react';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { defaultTo } from 'lodash';
import { changeSetting, changeAndSave } from '../actions/settings';
import {SettingsKeys} from '../actions/types/settings';
import {RootState} from '../actions/types/index';

export interface Props {
  field: SettingsKeys,
  instantSave?: boolean,
  readOnly?: boolean
}

export default connect((state: RootState, props: Props) => ({
  value: defaultTo(state.settings.edited[props.field], '')
}), (dispatch, props) => ({
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (props.instantSave) {
      dispatch(changeAndSave(props.field, ev.target.value));
    } else {
      dispatch(changeSetting(props.field, ev.target.value));
    }
  }
}), (stateProps, dispatchProps, ownProps) => {
  return { ...stateProps, ...dispatchProps, readOnly: ownProps.readOnly };
})(Input);
