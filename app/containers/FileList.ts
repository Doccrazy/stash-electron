import { connect } from 'react-redux';
import { entryContextMenu } from '../actions/contextMenus';
import { prepareDelete, select } from '../actions/currentEntry';
import { select as selectNode } from '../actions/currentNode';
import { open } from '../actions/edit';
import { toggleAndSave as toggleFavorite } from '../actions/favorites';
import { Dispatch, RootState } from '../actions/types/index';
import FileList from '../components/FileList';
import EntryPtr from '../domain/EntryPtr';
import { sortedFileListWithDetails } from '../store/selectors';

export default connect(
  (state: RootState) => ({
    files: sortedFileListWithDetails(state),
    selectedEntry: state.currentEntry.ptr,
    favorites: state.favorites,
    showPath: !!state.currentNode.specialId
  }),
  (dispatch: Dispatch) => ({
    onSelect: (ptr: EntryPtr) => dispatch(select(ptr)),
    onEdit: (ptr: EntryPtr) => dispatch(open(ptr)),
    onDelete: (ptr: EntryPtr) => dispatch(prepareDelete(ptr)),
    onToggleFavorite: (ptr: EntryPtr) => dispatch(toggleFavorite(ptr)),
    onSelectNode: (nodeId: string) => dispatch(selectNode(nodeId)),
    onContextMenu: (ptr: EntryPtr) => dispatch(entryContextMenu(ptr))
  })
)(FileList);
