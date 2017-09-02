import fs from 'fs-extra';
import path from 'path';
import alphanumSort from 'alphanum-sort';
import EventEmitter from 'events';
import { toastr } from 'react-redux-toastr';
import { EntryPtr, hierarchy } from '../utils/repository';

const LOAD = 'repository/LOAD';
const RESET_DIRS = 'repository/RESET_DIRS';
const READ_DIR = 'repository/READ_DIR';
const EXPAND = 'repository/EXPAND';
const CLOSE = 'repository/CLOSE';
const RENAME_ENTRY = 'repository/RENAME_ENTRY';
const DELETE_ENTRY = 'repository/DELETE_ENTRY';
const CREATE_ENTRY = 'repository/CREATE_ENTRY';
const DELETE_NODE = 'repository/DELETE_NODE';
const RENAME_NODE = 'repository/RENAME_NODE';

export function load(repoPath) {
  return async (dispatch, getState) => {
    dispatch({
      type: RESET_DIRS
    });
    dispatch({
      type: LOAD,
      payload: repoPath
    });
    repositoryEvents.emit('initialize', dispatch, getState);
  };
}

export function readDir(subPath, recurse = true) {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const dirPath = path.join(repository.path, subPath);

    console.time('readdirSync');
    //const files = fs.readdirSync(dirPath);
    const files = await fs.readdir(dirPath);
    console.timeEnd('readdirSync');
    console.time(`stat x${files.length}`);
    const fileStats = await Promise.all(files.map(fn => fs.stat(path.join(dirPath, fn))));
    console.timeEnd(`stat x${files.length}`);

    const result = {
      path: subPath,
      entries: [],
      children: []
    };
    files.forEach((file, idx) => {
      const stat = fileStats[idx];
      //const stat = fs.statSync(path.join(dirPath, file));
      if (stat.isFile()) {
        result.entries.push(file);
      } else if (stat.isDirectory()) {
        result.children.push(file);
      }
    });
    dispatch({
      type: READ_DIR,
      payload: result
    });
    if (recurse) {
      result.children.forEach(childId => dispatch(readDir(`${subPath}${childId}/`, false)));
    }
  };
}

function maybeExpand(dispatch, getState, subPath) {
  const { repository } = getState();
  if (repository.nodes[subPath].children && repository.nodes[subPath].children.length && !repository.open.has(subPath)) {
    dispatch({
      type: EXPAND,
      payload: subPath
    });
  }
}

export function expand(subPath) {
  return async (dispatch, getState) => {
    await dispatch(readDir(subPath));

    maybeExpand(dispatch, getState, subPath);
  };
}

export function close(subPath) {
  return {
    type: CLOSE,
    payload: subPath
  };
}

export function toggle(subPath) {
  return (dispatch, getState) => {
    const { repository } = getState();
    if (repository.open.has(subPath)) {
      dispatch(close(subPath));
    } else {
      dispatch(expand(subPath));
    }
  };
}

export function rename(ptr, newName) {
  return async (dispatch, getState) => {
    const { repository } = getState();

    const absPath = path.join(repository.path, ptr.nodeId, ptr.entry);
    const newPath = path.join(repository.path, ptr.nodeId, newName);
    try {
      await fs.rename(absPath, newPath);

      dispatch({
        type: RENAME_ENTRY,
        payload: {
          ptr,
          newName
        }
      });

      const newPtr = new EntryPtr(ptr.nodeId, newName);
      repositoryEvents.emit('rename', dispatch, getState, ptr, newPtr);
    } catch (e) {
      // rename failed
      toastr.error(`Failed to rename entry ${ptr.entry} to ${newName}: ${e}`);
    }
  };
}

export function deleteEntry(ptr) {
  return async (dispatch, getState) => {
    const { repository } = getState();

    const absPath = path.join(repository.path, ptr.nodeId, ptr.entry);

    try {
      await fs.unlink(absPath);

      dispatch({
        type: DELETE_ENTRY,
        payload: ptr
      });

      repositoryEvents.emit('delete', dispatch, getState, ptr);
    } catch (e) {
      // delete failed
      toastr.error(`Failed to delete entry ${ptr.entry}: ${e}`);
    }
  };
}

export function deleteNode(nodeId) {
  if (!nodeId || nodeId === '/') {
    return;
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    if (!node) {
      return;
    }

    const absPath = path.join(repository.path, nodeId);

    try {
      await fs.remove(absPath);

      dispatch({
        type: DELETE_NODE,
        payload: nodeId
      });

      repositoryEvents.emit('deleteNode', dispatch, getState, node);
    } catch (e) {
      // delete failed
      toastr.error(`Failed to delete folder ${node.name}: ${e}`);
    }
  };
}

export function createEntry(ptr) {
  return {
    type: CREATE_ENTRY,
    payload: ptr
  };
}

export function renameNode(nodeId, newName) {
  if (!nodeId || nodeId === '/') {
    return;
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[nodeId];
    if (!node) {
      return;
    }
    const parentNode = repository.nodes[node.parent];

    const absPath = path.join(repository.path, parentNode.id, node.name);
    const newPath = path.join(repository.path, parentNode.id, newName);

    try {
      await fs.rename(absPath, newPath);

      dispatch({
        type: RENAME_NODE,
        payload: {
          nodeId,
          newName
        }
      });

      const newId = `${parentNode.id}${newName}/`;
      repositoryEvents.emit('moveNode', dispatch, getState, nodeId, newId);
    } catch (e) {
      // rename failed
      toastr.error(`Failed to rename folder to ${newName}: ${e}`);
    }
  };
}

export const repositoryEvents = new EventEmitter();

const MULTI_OPEN = false;

export default function reducer(state = { nodes: { }, open: new Set() }, action) {
  switch (action.type) {
    case LOAD:
      return { ...state, path: action.payload };
    case RESET_DIRS:
      return { ...state, nodes: { '/': { id: '/', title: 'Root' } }, open: new Set(), selected: null };
    case READ_DIR: {
      const newNodes = { ...state.nodes };
      const subPath = action.payload.path;

      newNodes[subPath] = {
        ...newNodes[subPath],
        children: alphanumSort(action.payload.children.map(dir => `${subPath}${dir}/`)),
        entries: alphanumSort(action.payload.entries)
      };

      action.payload.children.forEach(dir => {
        newNodes[`${subPath}${dir}/`] = {
          ...newNodes[`${subPath}${dir}/`],
          id: `${subPath}${dir}/`,
          name: dir,
          title: dir,
          parent: subPath
        };
      });
      return { ...state, nodes: newNodes };
    }
    case EXPAND: {
      let newOpen;
      if (MULTI_OPEN) {
        newOpen = new Set(state.open).add(action.payload);
      } else {
        newOpen = new Set(hierarchy(state.nodes, action.payload).map(node => node.id));
      }
      return { ...state, open: newOpen };
    }
    case CLOSE: {
      const newOpen = new Set(state.open);
      newOpen.delete(action.payload);
      return { ...state, open: newOpen };
    }
    case RENAME_ENTRY: {
      const node = state.nodes[action.payload.ptr.nodeId];
      if (node) {
        const newNode = { ...node };
        newNode.entries = node.entries.filter(e => e !== action.payload.ptr.entry);
        newNode.entries.push(action.payload.newName);
        newNode.entries = alphanumSort(newNode.entries);

        const newNodes = { ...state.nodes, [action.payload.ptr.nodeId]: newNode };
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    case DELETE_ENTRY: {
      const node = state.nodes[action.payload.nodeId];
      if (node) {
        const newNode = { ...node };
        newNode.entries = node.entries.filter(e => e !== action.payload.entry);

        const newNodes = { ...state.nodes, [action.payload.nodeId]: newNode };
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    case CREATE_ENTRY: {
      const node = state.nodes[action.payload.nodeId];
      if (node) {
        const newNode = { ...node };
        newNode.entries = alphanumSort([...newNode.entries, action.payload.entry]);

        const newNodes = { ...state.nodes, [action.payload.nodeId]: newNode };
        return { ...state, nodes: newNodes };
      }
      return state;
    }
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
      const node = state.nodes[action.payload.nodeId];
      const newName = action.payload.newName;
      if (node) {
        const newParentNode = { ...state.nodes[node.parent] };

        const newNode = {
          ...node,
          id: `${newParentNode.id}${newName}/`,
          name: newName,
          title: newName
        };
        newParentNode.children = newParentNode.children.filter(childId => childId !== node.id);
        newParentNode.children.push(newNode.id);
        newParentNode.children = alphanumSort(newParentNode.children);

        const newNodes = { ...state.nodes, [newParentNode.id]: newParentNode, [newNode.id]: newNode };
        delete newNodes[node.id];
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    default:
      return state;
  }
}
