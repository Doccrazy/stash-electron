import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, select, startRename, closeRename, changeName, saveNode } from '../actions/currentNode';
import { create } from '../actions/edit';

export default connect(state => ({
  nodes: state.repository.nodes,
  currentNodeId: state.currentNode.nodeId,
  editing: state.currentNode.renaming,
  currentName: state.currentNode.name
}), dispatch => ({
  onSelectFolder: id => dispatch(select(id)),
  onRename: () => dispatch(startRename()),
  onDelete: () => dispatch(prepareDelete()),
  onCreateNode: nodeId => 0,
  onCreateItem: nodeId => dispatch(create(nodeId, 'password')),
  onChangeName: value => dispatch(changeName(value)),
  onCancelEdit: () => dispatch(closeRename()),
  onConfirmEdit: () => dispatch(saveNode())
}))(FolderActionBar);
