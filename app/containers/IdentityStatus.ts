import { connect } from 'react-redux';
import { lock, loadAndUnlockInteractive, openGenerate } from '../actions/privateKey';
import { browseForFile, changeAndSave } from '../actions/settings';
import { Dispatch, RootState } from '../actions/types/index';
import IdentityStatus from '../components/IdentityStatus';

export default connect(
  (state: RootState, props: {}) => ({
    username: state.privateKey.username,
    privateKeyPath: state.settings.current.privateKeyFile,
    privateKeyBits: state.privateKey.key && state.privateKey.key.toPublic().size,
    error: state.privateKey.error,
    lockAvailable: state.privateKey.encrypted,
    locked: state.privateKey.encrypted && !state.privateKey.key,
    recentPrivateKeys:
      state.settings.current.privateKeyFile && !state.privateKey.key && !state.privateKey.encrypted
        ? state.settings.current.privateKeys
        : state.settings.current.privateKeys.filter((keyInfo) => keyInfo.path !== state.settings.current.privateKeyFile)
  }),
  (dispatch: Dispatch, props) => ({
    onLock: () => dispatch(lock()),
    onUnlock: () => dispatch(loadAndUnlockInteractive()),
    onLoad: (path: string) => dispatch(changeAndSave('privateKeyFile', path)),
    onBrowse: () => dispatch(browseForFile('privateKeyFile', 'Select private key', undefined, true)),
    onGenerate: () => dispatch(openGenerate())
  })
)(IdentityStatus);
