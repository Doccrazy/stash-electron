import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, startRename, startCreate } from '../actions/currentNode';
import { createInCurrent } from '../actions/edit';
import { open as openImport } from '../actions/fileImport';
import { browseForAdd } from '../actions/external';

export default connect(state => ({
  editable: state.currentNode.nodeId !== '/'
}), dispatch => ({
  onRename: () => dispatch(startRename()),
  onDelete: () => dispatch(prepareDelete()),
  onCreateNode: () => dispatch(startCreate()),
  onCreateItem: () => dispatch(createInCurrent('password')),
  onEditPermissions: () => 0,
  onAddExternal: () => dispatch(browseForAdd()),
  onImport: () => dispatch(openImport())
}))(FolderActionBar);
