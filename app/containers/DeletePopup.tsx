import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, closeDelete } from '../actions/currentEntry';
import { Dispatch, RootState } from '../actions/types/index';
import { EntryNameLabel } from '../fileType/Components';

export default connect((state: RootState) => ({
  open: !!state.currentEntry.deleting,
  entry: state.currentEntry.deleting && state.currentEntry.deleting.entry
}), (dispatch: Dispatch) => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(closeDelete())
}))(
  ({ open, entry, onDelete, onClose }: Props) => (<ConfirmPopup open={open} title="Confirm deleting entry" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete <EntryNameLabel fileName={entry}/>?
  </ConfirmPopup>)
);

interface Props {
  open: boolean
  entry?: string
  onDelete: () => void
  onClose: () => void
}
