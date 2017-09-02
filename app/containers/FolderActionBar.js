import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, select } from '../actions/currentNode';
import { create } from '../actions/edit';

export default connect(state => ({
  nodes: state.repository.nodes,
  currentNodeId: state.currentNode.nodeId
}), dispatch => ({
  onSelectFolder: id => dispatch(select(id)),
  onRename: nodeId => 0,
  onDelete: nodeId => dispatch(prepareDelete(nodeId)),
  onCreateNode: nodeId => 0,
  onCreateItem: nodeId => dispatch(create(nodeId, 'password'))
}))(FolderActionBar);
