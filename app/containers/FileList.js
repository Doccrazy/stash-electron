import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FileList from '../components/FileList';
import { select } from '../actions/repository';

export default connect(state => ({
  currentNode: state.repository.nodes[state.repository.selected]
}), dispatch => ({
  // onSelectFolder: id => dispatch(select(id))
}))(FileList);
