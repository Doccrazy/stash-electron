import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { select } from '../actions/repository';

export default connect(state => ({
  nodes: state.repository.nodes,
  currentNodeId: state.repository.selected
}), dispatch => ({
  onSelectFolder: id => dispatch(select(id))
}))(FolderActionBar);
