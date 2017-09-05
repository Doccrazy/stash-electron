import alphanumSort from 'alphanum-sort';
import { toastr } from 'react-redux-toastr';
import PlainRepository from '../repository/Plain';
import { EntryPtr } from '../utils/repository';

export const LOAD = 'repository/LOAD';
export const RESET_DIRS = 'repository/RESET_DIRS';
export const READ_NODE = 'repository/READ_NODE';
export const RENAME_ENTRY = 'repository/RENAME_ENTRY';
export const DELETE_ENTRY = 'repository/DELETE_ENTRY';
export const CREATE_ENTRY = 'repository/CREATE_ENTRY';
export const UPDATE_ENTRY = 'repository/UPDATE_ENTRY';
export const DELETE_NODE = 'repository/DELETE_NODE';
export const RENAME_NODE = 'repository/RENAME_NODE';
export const CREATE_NODE = 'repository/CREATE_NODE';

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
  };
}

export function readNode(nodeId, recurse = true) {
  return async (dispatch, getState) => {
    const dirContents = await repo.readdir(nodeId);

    const result = {
      nodeId,
      entries: dirContents.get('entries').map(e => e.get('name')).toJS(),
      children: dirContents.get('children').toJS()
    };
    dispatch({
      type: READ_NODE,
      payload: result
    });
    const newNode = getState().repository.nodes[nodeId];
    if (recurse && newNode && newNode.children) {
      await Promise.all(newNode.children.map(childId => dispatch(readNode(childId, false))));
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
    } catch (e) {
      // delete failed
      toastr.error(`Failed to delete entry ${ptr.entry}: ${e}`);
    }
  };
}

export function deleteNode(nodeId) {
  if (!nodeId || nodeId === ROOT_ID) {
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
    } catch (e) {
      // delete failed
      toastr.error(`Failed to delete folder ${node.name}: ${e}`);
    }
  };
}

function createEntry(ptr) {
  return {
    type: CREATE_ENTRY,
    payload: ptr
  };
}

function updateEntry(ptr, buffer) {
  return {
    type: UPDATE_ENTRY,
    payload: {
      ptr,
      buffer
    }
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
    dispatch(updateEntry(ptr, buffer));
  };
}

export function renameNode(nodeId, newName) {
  if (!nodeId || nodeId === ROOT_ID) {
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
          newParentId: parentNode.id,
          newName
        }
      });
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
    } catch (e) {
      // mkdir failed
      toastr.error(`Failed to create folder ${name}: ${e}`);
      throw e;
    }
  };
}

const ROOT_ID = '/';
function makeId(parentNodeId, childName) {
  return `${parentNodeId}${childName}/`;
}

export default function reducer(state = { nodes: { } }, action) {
  switch (action.type) {
    case LOAD:
      return { ...state, nodes: { [ROOT_ID]: { id: ROOT_ID, title: action.payload } }, name: action.payload };
    case RESET_DIRS:
      return { ...state, nodes: { [ROOT_ID]: { id: ROOT_ID, title: 'Root' } } };
    case READ_NODE: {
      const newNodes = { ...state.nodes };
      const nodeId = action.payload.nodeId;

      newNodes[nodeId] = {
        ...newNodes[nodeId],
        children: alphanumSort(action.payload.children.map(dir => makeId(nodeId, dir)), { insensitive: true }),
        entries: alphanumSort(action.payload.entries, { insensitive: true })
      };

      action.payload.children.forEach(dir => {
        newNodes[makeId(nodeId, dir)] = {
          ...newNodes[makeId(nodeId, dir)],
          id: makeId(nodeId, dir),
          name: dir,
          title: dir,
          parent: nodeId
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
          id: makeId(newParentNode.id, newName),
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
          id: makeId(parentNode.id, name),
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
