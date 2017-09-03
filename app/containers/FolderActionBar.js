import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, startRename, startCreate } from '../actions/currentNode';
import { create } from '../actions/edit';

export default connect(state => ({
  editable: state.currentNode.nodeId !== '/'
}), dispatch => ({
  onRename: () => dispatch(startRename()),
  onDelete: () => dispatch(prepareDelete()),
  onCreateNode: () => dispatch(startCreate()),
  onCreateItem: nodeId => dispatch(create(nodeId, 'password')),
  onEditPermissions: () => 0,
  onAddExternal: () => 0,
  onImport: () => 0
}))(FolderActionBar);
