import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { browseForFolder } from '../actions/settings';
import { Dispatch } from '../actions/types';
import {SettingsKeys} from '../actions/types/settings';

export interface Props {
  field: SettingsKeys,
  title: string,
  children?: React.ReactNode
}

export default connect(() => ({
}), (dispatch: Dispatch, props: Props) => ({
  onClick: (ev: any) => { dispatch(browseForFolder(props.field, props.title)); }
}), (stateProps, dispatchProps, ownProps) => {
  return { ...stateProps, ...dispatchProps, children: ownProps.children };
})(Button);
