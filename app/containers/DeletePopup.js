import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, cancelDelete } from '../actions/currentEntry';
import typeFor from '../fileType';

export default connect(state => ({
  open: state.currentEntry.deleting,
  entry: state.currentEntry.ptr && state.currentEntry.ptr.entry
}), dispatch => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(cancelDelete())
}))(
  ({ open, entry, onDelete, onClose }) => (<ConfirmPopup open={open} title="Confirm deleting entry" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete {entry && typeFor(entry).format ? typeFor(entry).format(entry) : entry}?
  </ConfirmPopup>)
);
