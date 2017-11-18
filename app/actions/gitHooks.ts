import { Set } from 'immutable';
import EntryPtr from '../domain/EntryPtr';
import Node from '../domain/Node';
import typeFor from '../fileType/index';
import { afterAction } from '../store/eventMiddleware';
import { hierarchy } from '../utils/repository';
import * as AuthorizedUsers from './authorizedUsers';
import * as Edit from './edit';
import * as External from './external';
import * as FileImport from './fileImport';
import { maybeCommitChanges } from './git';
import * as Repository from './repository';
import { StatusType } from './types/fileImport';
import { GetState } from './types/index';

function fmtPtr(getState: GetState, ptr: EntryPtr) {
  const type = typeFor(ptr.entry);
  return `${type.toDisplayName(ptr.entry)} in ${fmtNode(getState, ptr.nodeId)}`;
}

function fmtNode(getState: GetState, node: Node | string) {
  const hier = hierarchy(getState().repository.nodes, node);
  return hier.length <= 1 ? '/' : hier.map(n => n.name).slice(1).slice(-2).join('/');
}

afterAction(Edit.Actions.SAVED, (dispatch, getState: GetState, { ptr, isNew }: { ptr: EntryPtr, isNew: boolean }) => {
  dispatch(maybeCommitChanges(`${isNew ? 'Create' : 'Edit'} ${fmtPtr(getState, ptr)}`));
});

afterAction(Repository.Actions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }: { ptr: EntryPtr, newName: string }) => {
  const typeNew = typeFor(newName);
  dispatch(maybeCommitChanges(`Rename ${fmtPtr(getState, ptr)} to ${typeNew.toDisplayName(newName)}`));
});

afterAction(Repository.Actions.DELETE_ENTRY, (dispatch, getState: GetState, { ptr }: { ptr: EntryPtr }) => {
  dispatch(maybeCommitChanges(`Delete ${fmtPtr(getState, ptr)}`));
});

afterAction(Repository.Actions.MOVE_ENTRY, (dispatch, getState: GetState, { ptr, newNodeId }: { ptr: EntryPtr, newNodeId: string }) => {
  dispatch(maybeCommitChanges(`Move ${fmtPtr(getState, ptr)} to ${fmtNode(getState, newNodeId)}`));
});

afterAction(Repository.Actions.MOVE_NODE, (dispatch, getState: GetState, { node, newNode }: { node: Node, newNode: Node }) => {
  const msg = node.parentId !== newNode.parentId ? `Move folder ${fmtNode(getState, newNode)} to ${fmtNode(getState, newNode.parentId!)}`
    : `Rename folder ${fmtNode(getState, node)} to ${newNode.name}`;
  dispatch(maybeCommitChanges(msg));
});

afterAction(Repository.Actions.DELETE_NODE, (dispatch, getState: GetState, node: Node) => {
  dispatch(maybeCommitChanges(`Delete folder ${fmtNode(getState, node)}`));
});

afterAction(AuthorizedUsers.Actions.SAVED, (dispatch, getState: GetState, nodeId: string) => {
  dispatch(maybeCommitChanges(`Update authorization for folder ${fmtNode(getState, nodeId)}`));
});

afterAction(External.Actions.FILES_WRITTEN, (dispatch, getState: GetState, files: EntryPtr[]) => {
  const nodeIds: Set<string> = Set(files.map(ptr => ptr.nodeId));
  if (files.length === 1) {
    dispatch(maybeCommitChanges(`Add/edit external file ${fmtPtr(getState, files[0])}`));
  } else {
    const nodeTxt = nodeIds.size === 1 ? fmtNode(getState, nodeIds.first()) : 'multiple folders';
    dispatch(maybeCommitChanges(`Add/edit ${files.length} external files in ${nodeTxt}`));
  }
});

afterAction(FileImport.Actions.STATUS, (dispatch, getState: GetState, payload: { type: StatusType, message: string }) => {
  if (payload.type === 'success') {
    dispatch(maybeCommitChanges(`Import entries from 3rd party file format`));
  }
});
