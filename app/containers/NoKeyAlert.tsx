import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';
import { loadAndUnlockInteractive } from '../actions/privateKey';
import { Dispatch, RootState } from '../actions/types/index';

export default connect((state: RootState, props: void) => ({
  keyLoaded: !!state.privateKey.key,
  keyEncrypted: state.privateKey.encrypted,
  loggedIn: !!state.privateKey.username
}), (dispatch: Dispatch, props) => ({
  onUnlock: () => dispatch(loadAndUnlockInteractive())
}))(({ keyLoaded, keyEncrypted, loggedIn, onUnlock }: Props) => {
  if (loggedIn) {
    return <div />;
  } else if (keyLoaded) {
    return (<Alert color="warning">
      You do not currently have access to the selected repository. You may either add yourself to the list of
      known users and ask someone else to authorize you, or load a different key.
    </Alert>);
  } else if (keyEncrypted) {
    return (<Alert color="warning">
      <i className="fa fa-lock" /> Your encrypted private key is locked. <a href="" className="alert-link" onClick={onUnlock}>
        Click here or press Ctrl+L to unlock with your passphrase
      </a>.
    </Alert>);
  } else {
    return (<Alert color="danger">
      No private key has been loaded or loading of the private key failed. Check settings.
    </Alert>);
  }
});

interface Props {
  keyLoaded: boolean
  keyEncrypted: boolean
  loggedIn: boolean
  onUnlock: () => void
}
