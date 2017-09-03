import alphanumSort from 'alphanum-sort';
import EventEmitter from 'events';
import { toastr } from 'react-redux-toastr';
import PlainRepository from '../repository/Plain';
import { EntryPtr } from '../utils/repository';

const LOAD = 'repository/LOAD';
const RESET_DIRS = 'repository/RESET_DIRS';
const READ_DIR = 'repository/READ_DIR';
const RENAME_ENTRY = 'repository/RENAME_ENTRY';
const DELETE_ENTRY = 'repository/DELETE_ENTRY';
const CREATE_ENTRY = 'repository/CREATE_ENTRY';
const DELETE_NODE = 'repository/DELETE_NODE';
const RENAME_NODE = 'repository/RENAME_NODE';
const CREATE_NODE = 'repository/CREATE_NODE';

let repo;

export function getRepo() {
  return repo;
}

export function load(repoPath) {
  return async (dispatch, getState) => {
    dispatch({
      type: RESET_DIRS
    });
    repo = new PlainRepository(repoPath);
    dispatch({
      type: LOAD,
      payload: repo.name
    });
    repositoryEvents.emit('initialize', dispatch, getState);
  };
}

export function readDir(subPath, recurse = true) {
  return async (dispatch, getState) => {
    const dirContents = await repo.readdir(subPath);

    const result = {
      path: subPath,
      entries: dirContents.get('entries').map(e => e.get('name')).toJS(),
      children: dirContents.get('children').toJS()
    };
    dispatch({
      type: READ_DIR,
      payload: result
    });
    if (recurse) {
      result.children.forEach(childId => dispatch(readDir(`${subPath}${childId}/`, false)));
    }
  };
}

export function rename(ptr, newName) {
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
    try {
      await repo.deleteFile(ptr.nodeId, ptr.entry);

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

    try {
      await repo.deleteDir(nodeId);

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
  return (dispatch, getState) => {
    dispatch({
      type: CREATE_ENTRY,
      payload: ptr
    });
    repositoryEvents.emit('createEntry', dispatch, getState, ptr);
  };
}

export function writeEntry(ptr, buffer) {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[ptr.nodeId];
    if (!node) {
      return;
    }
    const existing = node.entries && node.entries.indexOf(ptr.entry) >= 0;

    await getRepo().writeFile(ptr.nodeId, ptr.entry, buffer);

    if (!existing) {
      dispatch(createEntry(ptr));
    }
    repositoryEvents.emit('updateEntry', dispatch, getState, ptr, buffer);
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

    try {
      await repo.renameDir(parentNode.id, node.name, newName);

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

export function createChildNode(parentNodeId, name) {
  if (!parentNodeId) {
    return;
  }
  return async (dispatch, getState) => {
    const { repository } = getState();
    const parentNode = repository.nodes[parentNodeId];
    if (!parentNode) {
      return;
    }

    try {
      await repo.createDir(parentNode.id, name);

      dispatch({
        type: CREATE_NODE,
        payload: {
          parentNodeId,
          name
        }
      });

      repositoryEvents.emit('createNode', dispatch, getState, parentNode.id, name);
    } catch (e) {
      // mkdir failed
      toastr.error(`Failed to create folder ${name}: ${e}`);
      throw e;
    }
  };
}

export const repositoryEvents = new EventEmitter();

export default function reducer(state = { nodes: { } }, action) {
  switch (action.type) {
    case LOAD:
      return { ...state, nodes: { '/': { id: '/', title: action.payload } }, name: action.payload };
    case RESET_DIRS:
      return { ...state, nodes: { '/': { id: '/', title: 'Root' } } };
    case READ_DIR: {
      const newNodes = { ...state.nodes };
      const subPath = action.payload.path;

      newNodes[subPath] = {
        ...newNodes[subPath],
        children: alphanumSort(action.payload.children.map(dir => `${subPath}${dir}/`), { insensitive: true }),
        entries: alphanumSort(action.payload.entries, { insensitive: true })
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
    case RENAME_ENTRY: {
      const node = state.nodes[action.payload.ptr.nodeId];
      if (node) {
        const newNode = { ...node };
        newNode.entries = node.entries.filter(e => e !== action.payload.ptr.entry);
        newNode.entries.push(action.payload.newName);
        newNode.entries = alphanumSort(newNode.entries, { insensitive: true });

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
        newNode.entries = newNode.entries ? alphanumSort([...newNode.entries, action.payload.entry], { insensitive: true }) : [action.payload.entry];

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
        newParentNode.children = alphanumSort(newParentNode.children, { insensitive: true });

        const newNodes = { ...state.nodes, [newParentNode.id]: newParentNode, [newNode.id]: newNode };
        delete newNodes[node.id];
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    case CREATE_NODE: {
      const parentNode = state.nodes[action.payload.parentNodeId];
      const name = action.payload.name;
      if (parentNode) {
        const newNode = {
          id: `${parentNode.id}${name}/`,
          name,
          title: name,
          parent: parentNode.id
        };

        const newParentNode = { ...parentNode };
        newParentNode.children = newParentNode.children ? alphanumSort([...newParentNode.children, newNode.id], { insensitive: true }) : [newNode.id];

        const newNodes = { ...state.nodes, [newParentNode.id]: newParentNode, [newNode.id]: newNode };
        return { ...state, nodes: newNodes };
      }
      return state;
    }
    default:
      return state;
  }
}
