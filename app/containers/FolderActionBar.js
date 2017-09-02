import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { select } from '../actions/repository';
import { create } from '../actions/edit';

export default connect(state => ({
  nodes: state.repository.nodes,
  currentNodeId: state.repository.selected
}), dispatch => ({
  onSelectFolder: id => dispatch(select(id)),
  onCreateItem: nodeId => dispatch(create(nodeId, 'password'))
}))(FolderActionBar);
