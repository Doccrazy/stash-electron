import { defaultTo } from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import { changeAndSave, changeSetting } from '../actions/settings';
import { Dispatch, RootState } from '../actions/types/index';
import { StringSettings } from '../actions/types/settings';
import FileInput, { FileInputProps } from '../components/tools/FileInput';

export interface Props extends FileInputProps {
  field: keyof StringSettings,
  instantSave?: boolean
}

export default connect((state: RootState, props: Props) => ({
  value: defaultTo(state.settings.edited[props.field], '') as string | number | string[] | undefined
}), (dispatch: Dispatch, props: Props) => ({
  onChange: (ev: React.ChangeEvent<HTMLInputElement>) => {
    const value: string | number | undefined = ev.target.value;
    if (props.instantSave) {
      dispatch(changeAndSave(props.field, value));
    } else {
      dispatch(changeSetting(props.field, value));
    }
  }
}))(FileInput);
