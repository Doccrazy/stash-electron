import { connect } from 'react-redux';
import { deleteUser } from '../actions/keys';
import {RootState} from '../actions/types/index';
import UserKeyTable from '../components/UserKeyTable';
import {findUser} from '../repository/KeyProvider';

export default connect((state: RootState, props: void) => ({
  keysByUser: state.keys.byUser,
  currentUser: state.privateKey.key ? findUser(state.keys.byUser, state.privateKey.key) : null
}), (dispatch, props) => ({
  onDelete: (username: string) => dispatch(deleteUser(username))
}))(UserKeyTable);
