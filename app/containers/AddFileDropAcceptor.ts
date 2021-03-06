import React from 'react';
import { connect } from 'react-redux';
import 'redux-thunk';
import { nodeContextMenu } from '../actions/contextMenus';
import { addFiles } from '../actions/external';
import { Dispatch } from '../actions/types';
import FileDropAcceptor from '../components/FileDropAcceptor';

export interface Props {
  children: any;
  [propName: string]: any;
}

export default connect(null, (dispatch: Dispatch, props: Props) => ({
  onDrop: (files: string[]) => dispatch(addFiles(files)) as any,
  onContextMenu: (ev: React.MouseEvent) => {
    ev.preventDefault();
    dispatch(nodeContextMenu(undefined, true));
  }
}))(FileDropAcceptor);
