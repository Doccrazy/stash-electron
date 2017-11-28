import * as React from 'react';
import { connect } from 'react-redux';
import { Input } from 'reactstrap';
import { defaultTo } from 'lodash';
import { changeSetting, changeAndSave } from '../actions/settings';
import {StringSettings} from '../actions/types/settings';
import {RootState} from '../actions/types/index';

export interface Props {
  field: keyof StringSettings,
  instantSave?: boolean,
  readOnly?: boolean
}

export default connect((state: RootState, props: Props) => ({
  value: defaultTo(state.settings.edited[props.field], '') as string | number | string[] | undefined,
  readOnly: props.readOnly
}), (dispatch, props) => ({
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
    if (props.instantSave) {
      dispatch(changeAndSave(props.field, ev.target.value));
    } else {
      dispatch(changeSetting(props.field, ev.target.value));
    }
  }
}))(Input);
