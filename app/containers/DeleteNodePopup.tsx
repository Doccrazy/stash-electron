import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, closeDelete } from '../actions/currentNode';
import {RootState} from '../actions/types/index';

export default connect((state: RootState) => ({
  open: !!state.currentNode.deleting,
  title: state.currentNode.deleting && state.repository.nodes[state.currentNode.deleting] && state.repository.nodes[state.currentNode.deleting].name
}), dispatch => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(closeDelete())
}))(
  ({ open, title, onDelete, onClose }) => (<ConfirmPopup open={open} title="Confirm deleting folder" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete folder {title}? This will also remove all subfolders and entries of {title}.
  </ConfirmPopup>)
);
