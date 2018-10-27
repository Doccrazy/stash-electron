import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import { confirmDelete, closeDelete } from '../actions/currentNode';
import { Dispatch, RootState } from '../actions/types';
import PathLabel from '../components/PathLabel';
import { hierarchy } from '../utils/repository';

export default connect((state: RootState) => ({
  open: !!state.currentNode.deleting,
  path: state.currentNode.deleting && state.repository.nodes[state.currentNode.deleting]
    ? hierarchy(state.repository.nodes, state.currentNode.deleting).map(n => n.name) : []
}), (dispatch: Dispatch) => ({
  onDelete: () => dispatch(confirmDelete()),
  onClose: () => dispatch(closeDelete())
}))(
  ({ open, path, onDelete, onClose }: Props) => (<ConfirmPopup open={open} title="Confirm deleting folder" onConfirm={onDelete} onClose={onClose}>
    Are you sure you want to delete folder <PathLabel path={path} />? This will also remove all subfolders and entries of <PathLabel path={path} />.
  </ConfirmPopup>)
);

interface Props {
  open: boolean
  path: string[]
  onDelete: () => void
  onClose: () => void
}
