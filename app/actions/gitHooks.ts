import EntryPtr from '../domain/EntryPtr';
import Node from '../domain/Node';
import typeFor from '../fileType/index';
import { afterAction } from '../store/eventMiddleware';
import { hierarchy } from '../utils/repository';
import * as AuthorizedUsers from './authorizedUsers';
import * as Edit from './edit';
import { maybeCommitChanges } from './git';
import * as Repository from './repository';
import { GetState } from './types/index';

function fmtPtr(getState: GetState, ptr: EntryPtr) {
  const type = typeFor(ptr.entry);
  return `${type.toDisplayName(ptr.entry)} in ${fmtNode(getState, ptr.nodeId)}`;
}

function fmtNode(getState: GetState, node: Node | string) {
  const hier = hierarchy(getState().repository.nodes, node);
  return hier.length <= 1 ? '/' : hier.map(n => n.name).slice(1).slice(-2).join('/');
}

afterAction(Edit.Actions.SAVED, (dispatch, getState: GetState, ptr: EntryPtr) => {
  dispatch(maybeCommitChanges(`Edit ${fmtPtr(getState, ptr)}`));
});

afterAction(Repository.Actions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }: { ptr: EntryPtr, newName: string }) => {
  const typeNew = typeFor(newName);
  dispatch(maybeCommitChanges(`Rename ${fmtPtr(getState, ptr)} to ${typeNew.toDisplayName(newName)}`));
});

afterAction(Repository.Actions.DELETE_ENTRY, (dispatch, getState: GetState, ptr: EntryPtr) => {
  dispatch(maybeCommitChanges(`Delete ${fmtPtr(getState, ptr)}`));
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
