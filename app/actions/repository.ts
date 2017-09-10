import * as fs from 'fs';
import { toastr } from 'react-redux-toastr';
import * as settingsActions from './settings';
import PlainRepository from '../repository/Plain';
import EntryPtr from '../domain/EntryPtr';
import Node, {ROOT_ID} from '../domain/Node';
import { afterAction } from '../store/eventMiddleware';
import {State} from './types/repository';
import {Action, GetState, Thunk} from './types/index';
import Repository from '../repository/Repository';

export const LOAD = 'repository/LOAD';
export const FINISH_LOAD = 'repository/FINISH_LOAD';
export const UNLOAD = 'repository/UNLOAD';
export const READ_NODE = 'repository/READ_NODE';
export const READ_FULL = 'repository/READ_FULL';
export const RENAME_ENTRY = 'repository/RENAME_ENTRY';
export const DELETE_ENTRY = 'repository/DELETE_ENTRY';
export const CREATE_ENTRY = 'repository/CREATE_ENTRY';
export const UPDATE_ENTRY = 'repository/UPDATE_ENTRY';
export const DELETE_NODE = 'repository/DELETE_NODE';
export const RENAME_NODE = 'repository/RENAME_NODE';
export const CREATE_NODE = 'repository/CREATE_NODE';

let repo: Repository;

export function getRepo(): Repository {
  return repo;
}

export function load(repoPath?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch({
      type: UNLOAD
    });

    if (!repoPath || !fs.existsSync(repoPath)) {
      return;
    }
    const stat = fs.statSync(repoPath);
    if (!stat.isDirectory()) {
      return;
    }

    repo = new PlainRepository(repoPath);
    dispatch({
      type: LOAD,
      payload: {
        name: repo.name,
        path: repoPath
      }
    });
    await dispatch(readFull());
    dispatch({
      type: FINISH_LOAD
    });
  };
}

export function readNode(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const newNode = await repo.readNode(nodeId);

    dispatch({
      type: READ_NODE,
      payload: newNode
    });
  };
}

export function readFull(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const nodeList = await repo.readNodeRecursive('/');

    dispatch({
      type: READ_FULL,
      payload: nodeList
    });
  };
}

export function rename(ptr: EntryPtr, newName: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      await repo.renameFile(ptr.nodeId, ptr.entry, newName);

      dispatch({
        type: RENAME_ENTRY,
        payload: {
          ptr,
          newName
        }
      });
    } catch (e) {
      // rename failed
      toastr.error('', `Failed to rename entry ${ptr.entry} to ${newName}: ${e}`);
    }
  };
}

export function deleteEntry(ptr: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    try {
      await repo.deleteFile(ptr.nodeId, ptr.entry);

      dispatch({
        type: DELETE_ENTRY,
        payload: ptr
      });
    } catch (e) {
      // delete failed
      toastr.error('', `Failed to delete entry ${ptr.entry}: ${e}`);
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
        type: DELETE_NODE,
        payload: nodeId
      });
    } catch (e) {
      // delete failed
      toastr.error('', `Failed to delete folder ${node.name}: ${e}`);
    }
  };
}

function createEntry(ptr: EntryPtr): Action<EntryPtr> {
  return {
    type: CREATE_ENTRY,
    payload: ptr
  };
}

function updateEntry(ptr: EntryPtr, buffer: Buffer): Action<{ptr: EntryPtr, buffer: Buffer}> {
  return {
    type: UPDATE_ENTRY,
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
    const parentNode = repository.nodes[node.parentId];

    try {
      await repo.renameNode(node.id, newName);

      dispatch({
        type: RENAME_NODE,
        payload: {
          nodeId,
          newParentId: parentNode.id,
          newName
        }
      });
    } catch (e) {
      // rename failed
      toastr.error('', `Failed to rename folder to ${newName}: ${e}`);
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
        type: CREATE_NODE,
        payload: newNode
      });
    } catch (e) {
      // mkdir failed
      toastr.error('', `Failed to create folder ${name}: ${e}`);
      throw e;
    }
  };
}

afterAction([settingsActions.LOAD, settingsActions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();
  if (settings.current.repositoryPath !== settings.previous.repositoryPath) {
    dispatch(load(settings.current.repositoryPath));
  }
});

export default function reducer(state: State = { nodes: { } }, action: Action<any>): State {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        nodes: {[ROOT_ID]: new Node({id: ROOT_ID, name: action.payload.name})},
        name: action.payload.name,
        path: action.payload.path,
        loading: true
      };
    case FINISH_LOAD:
      return { ...state, loading: false };
    case UNLOAD:
      return { ...state, nodes: { }, name: undefined, path: undefined };
    // case READ_NODE: {
    //   const newNodes = { ...state.nodes };
    //   const nodeId = action.payload.nodeId;
    //
    //   newNodes[nodeId] = {
    //     ...newNodes[nodeId],
    //     children: alphanumSort(action.payload.children.map(dir => makeId(nodeId, dir)), { insensitive: true }),
    //     entries: alphanumSort(action.payload.entries, { insensitive: true })
    //   };
    //
    //   action.payload.children.forEach(dir => {
    //     newNodes[makeId(nodeId, dir)] = {
    //       ...newNodes[makeId(nodeId, dir)],
    //       id: makeId(nodeId, dir),
    //       name: dir,
    //       title: dir,
    //       parent: nodeId
    //     };
    //   });
    //   return { ...state, nodes: newNodes };
    // }
    case READ_FULL: {
      const nodeList: Node[] = action.payload;

      const newNodes: State['nodes'] = {};

      nodeList.forEach(node => {
        newNodes[node.id] = node;
      });
      return { ...state, nodes: newNodes };
    }

    case RENAME_ENTRY:
      return updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withEntryRenamed(action.payload.ptr.entry, action.payload.newName));
    case DELETE_ENTRY:
      return updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withEntryDeleted(action.payload.entry));
    case CREATE_ENTRY:
      return updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withNewEntry(action.payload.entry));

    case DELETE_NODE: {
      const node = state.nodes[action.payload];
      if (node) {
        const newNodes = { ...state.nodes };
        delete newNodes[action.payload];
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    case RENAME_NODE: {
      // const node = state.nodes[action.payload.nodeId];
      // const newName = action.payload.newName;
      // if (node) {
      //   const newParentNode = { ...state.nodes[node.parent] };
      //
      //   const newNode = {
      //     ...node,
      //     id: makeId(newParentNode.id, newName),
      //     name: newName,
      //     title: newName
      //   };
      //   newParentNode.children = newParentNode.children.filter(childId => childId !== node.id);
      //   newParentNode.children.push(newNode.id);
      //   newParentNode.children = alphanumSort(newParentNode.children, { insensitive: true });
      //
      //   const newNodes = { ...state.nodes, [newParentNode.id]: newParentNode, [newNode.id]: newNode };
      //   delete newNodes[node.id];
      //   return { ...state, nodes: newNodes };
      // }
      return state;
    }
    case CREATE_NODE: {
      const newNode = action.payload;
      const parentNode = state.nodes[newNode.parentId];
      if (parentNode) {
        const newParentNode = parentNode.withNewChild(newNode.id);

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
