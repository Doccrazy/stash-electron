import { connect } from 'react-redux';
import { openPopup } from '../../actions/git';
import { RootState } from '../../actions/types/index';
import GitInitializer, { GitInitAction } from '../../components/welcome/GitInitializer';

export default connect(
  (state: RootState, props: {}) => ({
    repoLoading: state.repository.loading,
    repoLoaded: !!state.repository.path && !state.repository.loading,
    status: state.git.status,
    working: state.git.working,
    action: undefined,
    cloneUrl: undefined
  }),
  (dispatch, props) => ({
    onClick: () => dispatch(openPopup()),
    onChangeAction: (action: GitInitAction) => 0,
    onChangeCloneUrl: (url: string) => 0,
    onClone: () => 0
  })
)(GitInitializer);
