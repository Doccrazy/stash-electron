import { connect } from 'react-redux';
import CurrentFolder from '../components/CurrentFolder';
import { select, closeEdit, changeName, saveNode } from '../actions/currentNode';
import {RootState} from '../actions/types/index';

export default connect((state: RootState) => ({
  nodes: state.repository.nodes,
  currentNodeId: state.currentNode.specialId ? undefined : state.currentNode.nodeId,
  currentSpecialId: state.currentNode.specialId,
  editing: state.currentNode.renaming || state.currentNode.creating,
  currentName: state.currentNode.name
}), dispatch => ({
  onSelectFolder: (nodeId: string) => dispatch(select(nodeId)),
  onChangeName: (value: string) => dispatch(changeName(value)),
  onCancelEdit: () => dispatch(closeEdit()),
  onConfirmEdit: () => dispatch(saveNode())
}))(CurrentFolder);
