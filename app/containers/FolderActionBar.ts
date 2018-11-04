import { connect } from 'react-redux';
import FolderActionBar from '../components/FolderActionBar';
import { prepareDelete, startRename, startCreate } from '../actions/currentNode';
import { createInCurrent } from '../actions/edit';
import { open as openImport } from '../actions/fileImport';
import { open as openExport } from '../actions/fileExport';
import { openCurrent as openPermissions } from '../actions/authorizedUsers';
import { browseForAdd } from '../actions/external';
import {ROOT_ID} from '../domain/Node';
import { Dispatch, RootState } from '../actions/types/index';
import PasswordType from '../fileType/password';
import { copyStashLink } from '../store/stashLinkHandler';
import {isAccessible} from '../utils/repository';

export default connect((state: RootState) => ({
  nodeEditable: state.currentNode.nodeId && state.currentNode.nodeId !== ROOT_ID && !state.currentNode.specialId,
  contentsEditable: state.currentNode.nodeId && !state.currentNode.specialId,
  accessible: state.currentNode.nodeId && !state.currentNode.specialId
    && isAccessible(state.repository.nodes, state.currentNode.nodeId, state.privateKey.username)
}), (dispatch: Dispatch) => ({
  onRename: () => dispatch(startRename()),
  onDelete: () => dispatch(prepareDelete()),
  onCreateNode: () => dispatch(startCreate()),
  onCreateItem: () => dispatch(createInCurrent(PasswordType.id)),
  onEditPermissions: () => dispatch(openPermissions()),
  onAddExternal: () => dispatch(browseForAdd()),
  onImport: () => dispatch(openImport()),
  onExport: () => dispatch(openExport()),
  onCopyLink: () => dispatch((_, getState) => copyStashLink(getState().currentNode.nodeId!))
}))(FolderActionBar);
