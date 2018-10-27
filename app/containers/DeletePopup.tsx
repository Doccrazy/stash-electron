import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, closeDelete } from '../actions/currentEntry';
import typeFor from '../fileType';
import { Dispatch, RootState } from '../actions/types/index';

function fmt(entry: string) {
  const type = typeFor(entry);
  return type.format ? type.format(entry) : entry;
}

export default connect((state: RootState) => ({
  open: !!state.currentEntry.deleting,
  entry: state.currentEntry.deleting && state.currentEntry.deleting.entry
}), (dispatch: Dispatch) => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(closeDelete())
}))(
  ({ open, entry, onDelete, onClose }: Props) => (<ConfirmPopup open={open} title="Confirm deleting entry" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete {entry ? fmt(entry) : entry}?
  </ConfirmPopup>)
);

interface Props {
  open: boolean
  entry?: string
  onDelete: () => void
  onClose: () => void
}
