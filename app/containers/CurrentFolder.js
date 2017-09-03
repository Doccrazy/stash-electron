import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CurrentFolder from '../components/CurrentFolder';
import { select, closeEdit, changeName, saveNode } from '../actions/currentNode';

export default connect(state => ({
  nodes: state.repository.nodes,
  currentNodeId: state.currentNode.nodeId,
  editing: state.currentNode.renaming || state.currentNode.creating,
  currentName: state.currentNode.name
}), dispatch => ({
  onSelectFolder: id => dispatch(select(id)),
  onChangeName: value => dispatch(changeName(value)),
  onCancelEdit: () => dispatch(closeEdit()),
  onConfirmEdit: () => dispatch(saveNode())
}))(CurrentFolder);
