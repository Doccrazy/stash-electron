import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, startRename, startCreate } from '../actions/currentNode';
import { createInCurrent } from '../actions/edit';
import { open as openImport } from '../actions/fileImport';
import { browseForAdd } from '../actions/external';
import {ROOT_ID} from '../domain/Node';

export default connect(state => ({
  nodeEditable: state.currentNode.nodeId && state.currentNode.nodeId !== ROOT_ID && !state.currentNode.specialId,
  contentsEditable: state.currentNode.nodeId && !state.currentNode.specialId
}), dispatch => ({
  onRename: () => dispatch(startRename()),
  onDelete: () => dispatch(prepareDelete()),
  onCreateNode: () => dispatch(startCreate()),
  onCreateItem: () => dispatch(createInCurrent('password')),
  onEditPermissions: () => 0,
  onAddExternal: () => dispatch(browseForAdd()),
  onImport: () => dispatch(openImport())
}))(FolderActionBar);
