import * as React from 'react';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';
import { loadAndUnlockInteractive } from '../actions/privateKey';
import { Dispatch, RootState } from '../actions/types/index';
import Trans from '../utils/i18n/Trans';

export default connect(
  (state: RootState, props: {}) => ({
    keyLoaded: !!state.privateKey.key,
    keyEncrypted: state.privateKey.encrypted,
    loggedIn: !!state.privateKey.username
  }),
  (dispatch: Dispatch, props) => ({
    onUnlock: () => dispatch(loadAndUnlockInteractive())
  })
)(({ keyLoaded, keyEncrypted, loggedIn, onUnlock }: Props) => {
  if (loggedIn) {
    return <div />;
  } else if (keyLoaded) {
    return (
      <Alert color="warning">
        <Trans id="component.noKeyAlert.keyLoaded" markdown />
      </Alert>
    );
  } else if (keyEncrypted) {
    return (
      <Alert color="warning">
        <Trans
          id="component.noKeyAlert.keyEncrypted"
          markdown
          link={
            <a href="" className="alert-link" onClick={onUnlock}>
              <Trans id="component.noKeyAlert.unlockLink" />
            </a>
          }
        />
      </Alert>
    );
  } else {
    return (
      <Alert color="danger">
        <Trans id="component.noKeyAlert.noKey" markdown />
      </Alert>
    );
  }
});

interface Props {
  keyLoaded: boolean;
  keyEncrypted: boolean;
  loggedIn: boolean;
  onUnlock: () => void;
}
