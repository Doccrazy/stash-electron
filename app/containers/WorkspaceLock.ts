import { connect } from 'react-redux';
import { lock, loadAndUnlockInteractive } from '../actions/privateKey';
import {RootState} from '../actions/types/index';
import WorkspaceLock from '../components/WorkspaceLock';

export default connect((state: RootState, props: void) => ({
  lockAvailable: state.privateKey.encrypted,
  locked: state.privateKey.encrypted && !state.privateKey.key
}), (dispatch, props) => ({
  onLock: () => dispatch(lock()),
  onUnlock: () => dispatch(loadAndUnlockInteractive())
}))(WorkspaceLock);
