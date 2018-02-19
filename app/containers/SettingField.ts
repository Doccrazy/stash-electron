import * as React from 'react';
import { connect } from 'react-redux';
import { Input, InputProps } from 'reactstrap';
import { defaultTo } from 'lodash';
import { changeSetting, changeAndSave } from '../actions/settings';
import {StringSettings} from '../actions/types/settings';
import {RootState} from '../actions/types/index';

export interface Props extends InputProps {
  field: keyof StringSettings,
  instantSave?: boolean
}

export default connect((state: RootState, props: Props) => ({
  value: defaultTo(state.settings.edited[props.field], '') as string | number | string[] | undefined
}), (dispatch, props: Props) => ({
  onKeyPress: props.type === 'number' ? (ev: React.KeyboardEvent<HTMLInputElement>) => {
    // unfortunately there is no <input type="integer">
    if (['.', ',', '+', '-', 'e'].includes(ev.key)) {
      ev.preventDefault();
    }
  } : undefined,
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number | undefined = ev.target.value;
    if (props.type === 'number') {
      value = value ? Number.parseInt(value) : undefined;
      if (value && typeof props.max === 'number' && value > props.max) {
        value = props.max;
      }
    }
    if (props.instantSave) {
      dispatch(changeAndSave(props.field, value));
    } else {
      dispatch(changeSetting(props.field, value));
    }
  }
}))(Input);
