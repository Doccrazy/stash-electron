import * as React from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { browseForFile } from '../actions/settings';
import {SettingsKeys} from '../actions/types/settings';

export interface Props {
  field: SettingsKeys,
  title: string,
  filters?: { extensions: string[], name: string }[],
  instantSave?: boolean,
  children?: React.ReactNode
}

export default connect(() => ({
}), (dispatch, props: Props) => ({
  onClick: (ev: any) => { dispatch(browseForFile(props.field, props.title, props.filters, props.instantSave)); }
}), (stateProps, dispatchProps, ownProps) => {
  return { ...stateProps, ...dispatchProps, children: ownProps.children };
})(Button);
