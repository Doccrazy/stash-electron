import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';
import { deleteUser } from '../actions/keys';
import {RootState} from '../actions/types/index';

export default connect((state: RootState, props: void) => ({
  keyLoaded: !!state.privateKey.key,
  loggedIn: !!state.privateKey.username
}), (dispatch, props) => ({
  onDelete: (username: string) => dispatch(deleteUser(username))
}))(({ keyLoaded, loggedIn }) => {
  if (loggedIn) {
    return <div />;
  } else if (keyLoaded) {
    return (<Alert color="warning">
      You do not currently have access to the selected repository. You may either add yourself to the list of
      known users and ask someone else to authorize you, or load a different key.
    </Alert>);
  } else {
    return (<Alert color="danger">
      No private key has been loaded or loading of the private key failed. Check settings.
    </Alert>);
  }
});
