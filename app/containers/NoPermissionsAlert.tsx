import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';
import { open as openPermissions } from '../actions/authorizedUsers';
import { Dispatch, RootState } from '../actions/types/index';
import { ROOT_ID } from '../domain/Node';
import { findAuthParent } from '../utils/repository';

export default connect((state: RootState, props: void) => ({
  keysAvailable: Object.keys(state.keys.byUser).length > 0,
  permissionsDefined: !!findAuthParent(state.repository.nodes, ROOT_ID)
}), (dispatch: Dispatch, props) => ({
  onOpenDialog: () => dispatch(openPermissions(ROOT_ID))
}))(({ keysAvailable, permissionsDefined, onOpenDialog }: Props) => {
  if (keysAvailable && !permissionsDefined) {
    return (<Alert color="warning">
      No permissions have been set up for this repository.
      Please <a href="#" onClick={onOpenDialog}>configure permissions on the repository root</a> to be able to create items.
    </Alert>);
  }
  return <div />;
});

interface Props {
  keysAvailable: boolean
  permissionsDefined: boolean
  onOpenDialog: () => void
}
