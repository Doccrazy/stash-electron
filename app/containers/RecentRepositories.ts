import { connect } from 'react-redux';
import { openClonePopup } from '../actions/git';
import { removeFromList } from '../actions/recentRepositories';
import { browseForFolder, changeAndSave } from '../actions/settings';
import { Dispatch, RootState } from '../actions/types';
import RecentRepositories from '../components/RecentRepositories';

export default connect((state: RootState) => ({
  repositories: state.settings.current.repositories,
  repositoryPath: state.repository.path,
  loading: state.repository.loading || state.git.working
}), (dispatch: Dispatch) => ({
  onClick: (path: string) => dispatch(changeAndSave('repositoryPath', path)),
  onRemove: (path: string) => dispatch(removeFromList(path)),
  onBrowseLocal: () => dispatch(browseForFolder('repositoryPath', 'Select repository path', true)),
  onCloneRemote: () => dispatch(openClonePopup())
}))(RecentRepositories);
