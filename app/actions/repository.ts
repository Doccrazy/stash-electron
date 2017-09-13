import * as fs from 'fs';
import { toastr } from 'react-redux-toastr';
import {List} from 'immutable';
import * as Settings from './settings';
import PlainRepository from '../repository/Plain';
import EntryPtr from '../domain/EntryPtr';
import Node, {ROOT_ID} from '../domain/Node';
import { afterAction } from '../store/eventMiddleware';
import {State} from './types/repository';
import {GetState, TypedAction, TypedThunk, OptionalAction} from './types/index';
import Repository from '../repository/Repository';

export enum Actions {
  LOAD = 'repository/LOAD',
  FINISH_LOAD = 'repository/FINISH_LOAD',
  UNLOAD = 'repository/UNLOAD',
  READ_NODE = 'repository/READ_NODE',
  READ_FULL = 'repository/READ_FULL',
  RENAME_ENTRY = 'repository/RENAME_ENTRY',
  DELETE_ENTRY = 'repository/DELETE_ENTRY',
  CREATE_ENTRY = 'repository/CREATE_ENTRY',
  UPDATE_ENTRY = 'repository/UPDATE_ENTRY',
  DELETE_NODE = 'repository/DELETE_NODE',
  RENAME_NODE = 'repository/RENAME_NODE',
  CREATE_NODE = 'repository/CREATE_NODE'
}

let repo: Repository;

export function getRepo(): Repository {
  return repo;
}

export function load(repoPath?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch({
      type: Actions.UNLOAD
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
      type: Actions.LOAD,
      payload: {
        name: repo.name,
        path: repoPath
      }
    });
    try {
      await dispatch(readFull());

      dispatch({
        type: Actions.FINISH_LOAD
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

export function readNode(nodeId: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const newNode = await repo.readNode(nodeId);

    dispatch({
      type: Actions.READ_NODE,
      payload: newNode
    });
  };
}

export function readFull(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const nodeList = await repo.readNodeRecursive('/');

    dispatch({
      type: Actions.READ_FULL,
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
        payload: ptr
      });
    } catch (e) {
      // delete failed
      console.error(e);
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
        type: Actions.DELETE_NODE,
        payload: nodeId
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
    const parentNode = repository.nodes[node.parentId];

    try {
      await repo.renameNode(node.id, newName);

      dispatch({
        type: Actions.RENAME_NODE,
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
  | OptionalAction<Actions.FINISH_LOAD>
  | OptionalAction<Actions.UNLOAD>
  | TypedAction<Actions.READ_NODE, Node>
  | TypedAction<Actions.READ_FULL, List<Node>>
  | TypedAction<Actions.RENAME_ENTRY, { ptr: EntryPtr, newName: string }>
  | TypedAction<Actions.DELETE_ENTRY, EntryPtr>
  | TypedAction<Actions.CREATE_ENTRY, EntryPtr>
  | TypedAction<Actions.UPDATE_ENTRY, { ptr: EntryPtr, buffer: Buffer }>
  | TypedAction<Actions.DELETE_NODE, string>
  | TypedAction<Actions.RENAME_NODE, { nodeId: string, newParentId: string, newName: string }>
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
    case Actions.READ_FULL: {
      const nodeList = action.payload;

      const newNodes: State['nodes'] = {};

      nodeList.forEach((node: Node) => {
        newNodes[node.id] = node;
      });
      return { ...state, nodes: newNodes };
    }

    case Actions.RENAME_ENTRY:
      return updatingNode(state, action.payload.ptr.nodeId, node =>
        node.withEntryRenamed(action.payload.ptr.entry, action.payload.newName));
    case Actions.DELETE_ENTRY:
      return updatingNode(state, action.payload.nodeId, node =>
        node.withEntryDeleted(action.payload.entry));
    case Actions.CREATE_ENTRY:
      return updatingNode(state, action.payload.nodeId, node =>
        node.withNewEntry(action.payload.entry));

    case Actions.DELETE_NODE: {
      const node = state.nodes[action.payload];
      if (node) {
        const newNodes = { ...state.nodes };
        delete newNodes[action.payload];
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    case Actions.RENAME_NODE: {
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
    case Actions.CREATE_NODE: {
      const newNode = action.payload;
      const parentNode = state.nodes[newNode.parentId as string];
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
