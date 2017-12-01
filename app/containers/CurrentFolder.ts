import { connect } from 'react-redux';
import CurrentFolder from '../components/CurrentFolder';
import { ROOT_ID } from '../domain/Node';
import specialFolders from '../utils/specialFolders';
import { select, closeEdit, changeName, saveNode, startRename } from '../actions/currentNode';
import {RootState} from '../actions/types/index';

export default connect((state: RootState) => ({
  nodes: state.repository.nodes,
  currentNodeId: state.currentNode.specialId ? undefined : state.currentNode.nodeId,
  specialFolder: state.currentNode.specialId ? {
    title: specialFolders[state.currentNode.specialId].title(state),
    icon: specialFolders[state.currentNode.specialId].icon
  } : undefined,
  nodeEditable: !!state.currentNode.nodeId && state.currentNode.nodeId !== ROOT_ID && !state.currentNode.specialId,
  editing: state.currentNode.renaming || state.currentNode.creating,
  currentName: state.currentNode.name
}), dispatch => ({
  onSelectFolder: (nodeId: string) => dispatch(select(nodeId)),
  onRename: () => dispatch(startRename()),
  onChangeName: (value: string) => dispatch(changeName(value)),
  onCancelEdit: () => dispatch(closeEdit()),
  onConfirmEdit: () => dispatch(saveNode())
}))(CurrentFolder);
