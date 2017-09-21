import { connect } from 'react-redux';
import {openAdd, reload, save} from '../actions/keys';
import {RootState} from '../actions/types/index';
import UserKeyActionBar from '../components/UserKeyActionBar';

export default connect((state: RootState, props: void) => ({
  modified: state.keys.modified
}), (dispatch, props) => ({
  onAdd: () => dispatch(openAdd()),
  onSave: () => dispatch(save()),
  onUndo: () => dispatch(reload())
}))(UserKeyActionBar);
