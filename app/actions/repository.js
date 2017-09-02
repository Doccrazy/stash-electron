import fs from 'fs-extra';
import path from 'path';
import alphanumSort from 'alphanum-sort';
import EventEmitter from 'events';
import { EntryPtr, hierarchy } from '../utils/repository';

const LOAD = 'repository/LOAD';
const RESET_DIRS = 'repository/RESET_DIRS';
const READ_DIR = 'repository/READ_DIR';
const EXPAND = 'repository/EXPAND';
const CLOSE = 'repository/CLOSE';
const SELECT = 'repository/SELECT';
const RENAME_ENTRY = 'repository/RENAME_ENTRY';

export function load(repoPath) {
  return async dispatch => {
    dispatch({
      type: RESET_DIRS
    });
    dispatch({
      type: LOAD,
      payload: repoPath
    });
    await dispatch(select('/'));
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

export function select(subPath) {
  return async (dispatch, getState) => {
    await dispatch(readDir(subPath));
    repositoryEvents.emit('clearSelection', dispatch, getState);
    dispatch({
      type: SELECT,
      payload: subPath
    });
    maybeExpand(dispatch, getState, subPath);
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
    case SELECT:
      return { ...state, selected: action.payload };
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
    default:
      return state;
  }
}
