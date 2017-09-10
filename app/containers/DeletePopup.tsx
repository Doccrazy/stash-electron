import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, cancelDelete } from '../actions/currentEntry';
import typeFor from '../fileType';

function fmt(entry: string) {
  const type = typeFor(entry);
  return type.format ? type.format(entry) : entry
}

export default connect(state => ({
  open: state.currentEntry.deleting,
  entry: state.currentEntry.ptr && state.currentEntry.ptr.entry
}), dispatch => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(cancelDelete())
}))(
  ({ open, entry, onDelete, onClose }) => (<ConfirmPopup open={open} title="Confirm deleting entry" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete {entry ? fmt(entry) : entry}?
  </ConfirmPopup>)
);