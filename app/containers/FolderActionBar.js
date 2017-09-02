import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, select, startRename, startCreate, closeEdit, changeName, saveNode } from '../actions/currentNode';
import { create } from '../actions/edit';

export default connect(state => ({
  nodes: state.repository.nodes,
  currentNodeId: state.currentNode.nodeId,
  editing: state.currentNode.renaming || state.currentNode.creating,
  currentName: state.currentNode.name
}), dispatch => ({
  onSelectFolder: id => dispatch(select(id)),
  onRename: () => dispatch(startRename()),
  onDelete: () => dispatch(prepareDelete()),
  onCreateNode: () => dispatch(startCreate()),
  onCreateItem: nodeId => dispatch(create(nodeId, 'password')),
  onChangeName: value => dispatch(changeName(value)),
  onCancelEdit: () => dispatch(closeEdit()),
  onConfirmEdit: () => dispatch(saveNode())
}))(FolderActionBar);
