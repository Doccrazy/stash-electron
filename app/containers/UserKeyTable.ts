import { connect } from 'react-redux';
import { copyToClipboard, deleteUser } from '../actions/keys';
import { changeAndSave } from '../actions/settings';
import { Dispatch, RootState, Thunk } from '../actions/types';
import { KeyFormat } from '../actions/types/settings';
import UserKeyTable from '../components/UserKeyTable';
import {findUser} from '../repository/KeyProvider';

export default connect((state: RootState, props: {}) => ({
  keysByUser: state.keys.edited,
  currentUser: state.privateKey.key ? findUser(state.keys.edited, state.privateKey.key) : null,
  keyFormat: state.settings.current.keyDisplayFormat
}), (dispatch: Dispatch, props) => ({
  onToggleKeyFormat: () => dispatch(toggleKeyFormat()),
  onCopyKey: (username: string) => dispatch(copyToClipboard(username)),
  onDelete: (username: string) => dispatch(deleteUser(username))
}))(UserKeyTable);

function toggleKeyFormat(): Thunk<void> {
  return (dispatch, getState) => {
    const ALL = Object.values(KeyFormat);

    const current = getState().settings.current.keyDisplayFormat;
    const next = ALL[ALL.indexOf(current) + 1 % ALL.length] as KeyFormat;
    dispatch(changeAndSave('keyDisplayFormat', next));
  };
}
