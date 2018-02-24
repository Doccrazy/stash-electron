import * as fs from 'fs';
import { toastr } from 'react-redux-toastr';
import {List} from 'immutable';
import * as Settings from './settings';
import EncryptedRepository from '../repository/Encrypted';
import EntryPtr from '../domain/EntryPtr';
import Node, {ROOT_ID} from '../domain/Node';
import { afterAction } from '../store/eventMiddleware';
import {State} from './types/repository';
import {GetState, TypedAction, TypedThunk, OptionalAction} from './types/index';
import Repository from '../repository/Repository';
import { hasChildOrEntry, readNodeRecursive, recursiveChildIds } from '../utils/repository';
import KeyProvider from '../repository/KeyProvider';
import KeyFileKeyProvider from '../repository/KeyFileKeyProvider';
import UsersFileAuthorizationProvider from '../repository/UsersFileAuthorizationProvider';
import AuthorizationProvider from '../repository/AuthorizationProvider';

export enum Actions {
  LOAD = 'repository/LOAD',
  FINISH_LOAD = 'repository/FINISH_LOAD',
  UNLOAD = 'repository/UNLOAD',
  READ_NODE_LIST = 'repository/READ_NODE_LIST',
  RENAME_ENTRY = 'repository/RENAME_ENTRY',
  DELETE_ENTRY = 'repository/DELETE_ENTRY',
  MOVE_ENTRY = 'repository/MOVE_ENTRY',
  CREATE_ENTRY = 'repository/CREATE_ENTRY',
  UPDATE_ENTRY = 'repository/UPDATE_ENTRY',
  DELETE_NODE = 'repository/DELETE_NODE',
  MOVE_NODE = 'repository/MOVE_NODE',
  CREATE_NODE = 'repository/CREATE_NODE'
}

let repo: Repository;
let keyProvider: KeyProvider;
let authProvider: AuthorizationProvider;

export function getRepo(): Repository {
  return repo;
}

export function getKeyProvider(): KeyProvider {
  return keyProvider;
}

export function getAuthProvider(): AuthorizationProvider {
  return authProvider;
}

export function load(repoPath?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const isReload = repoPath === getState().repository.path;
    if (!isReload) {
      dispatch({
        type: Actions.UNLOAD
      });
    }

    if (!repoPath || !fs.existsSync(repoPath)) {
      return;
    }
    const stat = fs.statSync(repoPath);
    if (!stat.isDirectory()) {
      return;
    }

    keyProvider = await KeyFileKeyProvider.create(repoPath);
    authProvider = new UsersFileAuthorizationProvider(repoPath, keyProvider);
    repo = new EncryptedRepository(repoPath, authProvider);
    dispatch({
      type: Actions.LOAD,
      payload: {
        name: repo.name,
        path: repoPath
      }
    });
    try {
      await dispatch(readRecursive(ROOT_ID));

      dispatch({
        type: Actions.FINISH_LOAD,
        payload: isReload
      });
    } catch (e) {
      dispatch({
        type: Actions.UNLOAD
      });

      console.error(e);
      toastr.error('Failed to open repository', e.message || e);
    }
  };
}

// Gimme fuel, gimme fire / Gimme that which I desire
export function reload(): Thunk<Promise<void>> {
  return (dispatch, getState) => {
    const repoPath = getState().repository.path;

    return dispatch(load(repoPath));
  };
}

export function readNode(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const newNode = await repo.readNode(nodeId);

    dispatch({
      type: Actions.READ_NODE_LIST,
      payload: List([newNode])
    });
  };
}

export function readRecursive(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const nodeList = await readNodeRecursive(id => repo.readNode(id), nodeId);

    dispatch({
      type: Actions.READ_NODE_LIST,
      payload: nodeList
    });
  };
}

export function rename(ptr: EntryPtr, newName: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      await repo.renameFile(ptr.nodeId, ptr.entry, newName);

      dispatch({
        type: Actions.RENAME_ENTRY,
        payload: {
          ptr,
          newName
        }
      });
    } catch (e) {
      // rename failed
      console.error(e);
      toastr.error('', `Failed to rename entry ${ptr.entry} to ${newName}: ${e}`);
    }
  };
}

export function deleteEntry(ptr: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      await repo.deleteFile(ptr.nodeId, ptr.entry);

      dispatch({
        type: Actions.DELETE_ENTRY,
        payload: {
          ptr
        }
      });
    } catch (e) {
      // delete failed
      console.error(e);
      toastr.error('', `Failed to delete entry ${ptr.entry}: ${e}`);
    }
  };
}

export function moveEntry(ptr: EntryPtr, newNodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const targetNode = getState().repository.nodes[newNodeId];
    if (hasChildOrEntry(getState().repository.nodes, targetNode, ptr.entry)) {
      toastr.error('', `Cannot move: File already exists`);
      return;
    }

    try {
      await repo.moveFile(ptr.nodeId, ptr.entry, newNodeId);

      dispatch({
        type: Actions.MOVE_ENTRY,
        payload: {
          ptr,
          newNodeId
        }
      });

      toastr.success('', `Moved ${ptr.entry} to ${targetNode.name}`);
    } catch (e) {
      // delete failed
      console.error(e);
      toastr.error('', `Failed to move entry ${ptr.entry}: ${e}`);
    }
  };
}

export function deleteNode(nodeId: string): Thunk<Promise<void>> {
  if (!nodeId || nodeId === ROOT_ID) {
    throw new Error(`Invalid node ${nodeId}`);
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    if (!node) {
      return;
    }

    try {
      await repo.deleteNode(nodeId);

      dispatch({
        type: Actions.DELETE_NODE,
        payload: node
      });
    } catch (e) {
      // delete failed
      console.error(e);
      toastr.error('', `Failed to delete folder ${node.name}: ${e}`);
    }
  };
}

function createEntry(ptr: EntryPtr): Action {
  return {
    type: Actions.CREATE_ENTRY,
    payload: ptr
  };
}

function updateEntry(ptr: EntryPtr, buffer: Buffer): Action {
  return {
    type: Actions.UPDATE_ENTRY,
    payload: {
      ptr,
      buffer
    }
  };
}

export function writeEntry(ptr: EntryPtr, buffer: Buffer): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[ptr.nodeId];
    if (!node) {
      return;
    }
    const existing = node.entries && node.entries.includes(ptr.entry);

    await getRepo().writeFile(ptr.nodeId, ptr.entry, buffer);

    if (!existing) {
      dispatch(createEntry(ptr));
    }
    dispatch(updateEntry(ptr, buffer));
  };
}

export function renameNode(nodeId: string, newName: string): Thunk<Promise<void>> {
  if (!nodeId || nodeId === ROOT_ID) {
    throw new Error(`Invalid node ${nodeId}`);
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    if (!node || !node.parentId) {
      return;
    }

    try {
      const newId = await repo.renameNode(node.id, newName);

      dispatch({
        type: Actions.MOVE_NODE,
        payload: {
          node: node,
          newNode: new Node({ id: newId, name: newName, parentId: node.parentId })
        }
      });
      dispatch(readRecursive(newId));
    } catch (e) {
      // rename failed
      console.error(e);
      toastr.error('', `Failed to rename folder to ${newName}: ${e}`);
    }
  };
}

export function moveNode(nodeId: string, newParentId: string): Thunk<Promise<void>> {
  if (!nodeId || nodeId === ROOT_ID) {
    throw new Error(`Invalid node ${nodeId}`);
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    const newParentNode = repository.nodes[newParentId];
    if (!node || !node.parentId || !newParentNode) {
      return;
    }

    try {
      const newId = await repo.moveNode(node.id, newParentId);

      dispatch({
        type: Actions.MOVE_NODE,
        payload: {
          node: node,
          newNode: new Node({ id: newId, name: node.name, parentId: newParentId })
        }
      });
      dispatch(readRecursive(newId));
    } catch (e) {
      // move failed
      console.error(e);
      toastr.error('', `Failed to move folder to ${newParentNode.name}: ${e}`);
    }
  };
}

export function mergeNode(nodeId: string, targetNodeId: string): Thunk<Promise<void>> {
  if (!nodeId || nodeId === ROOT_ID) {
    throw new Error(`Invalid node ${nodeId}`);
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    const targetNode = repository.nodes[targetNodeId];
    if (!node || !node.parentId || !targetNode) {
      return;
    }

    try {
      await repo.mergeNode(nodeId, targetNodeId);

      dispatch({
        type: Actions.DELETE_NODE,
        payload: node
      });
      dispatch(readRecursive(targetNodeId));
    } catch (e) {
      // move failed
      console.error(e);
      toastr.error('', `Failed to merge folder into ${targetNode.name}: ${e}`);
    }
  };
}

export function createChildNode(parentNodeId: string, name: string): Thunk<Promise<void>> {
  if (!parentNodeId) {
    throw new Error('Missing parentId');
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const parentNode = repository.nodes[parentNodeId];
    if (!parentNode) {
      return;
    }

    try {
      const newNode = await repo.createNode(parentNode.id, name);

      dispatch({
        type: Actions.CREATE_NODE,
        payload: newNode
      });
    } catch (e) {
      // mkdir failed
      toastr.error('', `Failed to create folder ${name}: ${e}`);
      throw e;
    }
  };
}

afterAction([Settings.Actions.LOAD, Settings.Actions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();
  if (settings.current.repositoryPath !== settings.previous.repositoryPath) {
    dispatch(load(settings.current.repositoryPath));
  }
});

type Action =
  TypedAction<Actions.LOAD, { name: string, path: string }>
  | TypedAction<Actions.FINISH_LOAD, boolean>
  | OptionalAction<Actions.UNLOAD>
  | TypedAction<Actions.READ_NODE_LIST, List<Node>>
  | TypedAction<Actions.RENAME_ENTRY, { ptr: EntryPtr, newName: string }>
  | TypedAction<Actions.DELETE_ENTRY, { ptr: EntryPtr }>
  | TypedAction<Actions.MOVE_ENTRY, { ptr: EntryPtr, newNodeId: string }>
  | TypedAction<Actions.CREATE_ENTRY, EntryPtr>
  | TypedAction<Actions.UPDATE_ENTRY, { ptr: EntryPtr, buffer: Buffer }>
  | TypedAction<Actions.DELETE_NODE, Node>
  | TypedAction<Actions.MOVE_NODE, { node: Node, newNode: Node }>
  | TypedAction<Actions.CREATE_NODE, Node>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { nodes: { } }, action: Action): State {
  switch (action.type) {
    case Actions.LOAD:
      return {
        ...state,
        nodes: {[ROOT_ID]: new Node({id: ROOT_ID, name: action.payload.name})},
        name: action.payload.name,
        path: action.payload.path,
        loading: true
      };
    case Actions.FINISH_LOAD:
      return { ...state, loading: false };
    case Actions.UNLOAD:
      return { ...state, nodes: { }, name: undefined, path: undefined, loading: false };
    case Actions.READ_NODE_LIST: {
      const nodeList = action.payload;

      const newNodes: State['nodes'] = { ...state.nodes };

      nodeList.forEach((node: Node) => {
        newNodes[node.id] = node;
      });
      return { ...state, nodes: newNodes };
    }

    case Actions.RENAME_ENTRY:
      return updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withEntryRenamed(action.payload.ptr.entry, action.payload.newName));
    case Actions.DELETE_ENTRY:
      return updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withEntryDeleted(action.payload.ptr.entry));
    case Actions.MOVE_ENTRY: {
      const intermediate = updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withEntryDeleted(action.payload.ptr.entry));
      return updatingNode(intermediate, action.payload.newNodeId, node =>
        node.withNewEntry(action.payload.ptr.entry));
    }
    case Actions.CREATE_ENTRY:
      return updatingNode(state, action.payload.nodeId, node =>
        node.withNewEntry(action.payload.entry));

    case Actions.DELETE_NODE: {
      const node = state.nodes[action.payload.id];
      if (node && node.parentId) {
        // remove node from parent
        const newParentNode = state.nodes[node.parentId].withChildDeleted(node.id);

        // remove all children of old node
        const allChildIds = recursiveChildIds(state.nodes, node.id);
        const newNodes = { ...state.nodes, [newParentNode.id]: newParentNode };
        allChildIds.forEach(childId => { delete newNodes[childId]; });
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    case Actions.MOVE_NODE: {
      const intermediate = reducer(state, { type: Actions.DELETE_NODE, payload: action.payload.node });
      return reducer(intermediate, { type: Actions.CREATE_NODE, payload: action.payload.newNode });
    }
    case Actions.CREATE_NODE: {
      const newNode = action.payload;
      const parentNode = state.nodes[newNode.parentId as string];
      if (parentNode) {
        // insert new node into parent
        const newParentNode = parentNode.withNewChild(newNode.id);

        // add to node list
        const newNodes = { ...state.nodes, [newParentNode.id]: newParentNode, [newNode.id]: newNode };
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    default:
      return state;
  }
}

function updatingNode(state: State, nodeId: string, updater: (node: Node) => Node): State {
  const node = state.nodes[nodeId];
  if (node) {
    const newNode = updater(node);

    const newNodes = { ...state.nodes, [nodeId]: newNode };
    return { ...state, nodes: newNodes };
  }
  return state;
}
