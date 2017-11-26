import { connect } from 'react-redux';
import { closeClonePopup, cloneAndLoad, changeCloneTarget, changeCloneUrl, browseForTarget } from '../actions/git';
import {RootState} from '../actions/types/index';
import GitClonePopup from '../components/GitClonePopup';

export default connect((state: RootState) => ({
  open: state.git.clone.open,
  working: state.git.working,
  valid: !!state.git.clone.remoteUrl && !!state.git.clone.remoteUrl,
  feedback: state.git.progressStatus,
  url: state.git.clone.remoteUrl,
  target: state.git.clone.target
}), dispatch => ({
  onChangeUrl: (url: string) => dispatch(changeCloneUrl(url)),
  onChangeTarget: (target: string) => dispatch(changeCloneTarget(target)),
  onBrowseTarget: () => dispatch(browseForTarget()),
  onClone: () => dispatch(cloneAndLoad()),
  onClose: () => dispatch(closeClonePopup())
}))(GitClonePopup);
