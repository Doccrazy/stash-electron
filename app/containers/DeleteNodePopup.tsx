import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, cancelDelete } from '../actions/currentNode';

export default connect(state => ({
  open: state.currentNode.deleting,
  title: state.currentNode.nodeId && state.repository.nodes[state.currentNode.nodeId] && state.repository.nodes[state.currentNode.nodeId].title
}), dispatch => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(cancelDelete())
}))(
  ({ open, title, onDelete, onClose }) => (<ConfirmPopup open={open} title="Confirm deleting folder" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete folder {title}? This will also remove all subfolders and entries of {title}.
  </ConfirmPopup>)
);
