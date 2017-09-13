import EntryPtr from '../domain/EntryPtr';
import * as repoActions from './repository';
import * as curNodeActions from './currentNode';
import { afterAction } from '../store/eventMiddleware';
import typeFor from '../fileType';
import {State} from './types/currentEntry';
import {Action, GetState, Thunk} from './types/index';
import {toastr} from 'react-redux-toastr';

const SELECT = 'currentEntry/SELECT';
const RESELECT = 'currentEntry/RESELECT';
const READ = 'currentEntry/READ';
const CLEAR = 'currentEntry/CLEAR';
const PREPARE_DELETE = 'currentEntry/PREPARE_DELETE';
const CANCEL_DELETE = 'currentEntry/CANCEL_DELETE';

export function select(ptr: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[ptr.nodeId];
    if (!node || !node.entries || !node.entries.includes(ptr.entry)) {
      return;
    }

    dispatch({
      type: SELECT,
      payload: ptr
    });

    await dispatch(read());
  };
}

export function reselect(ptr: EntryPtr): Action<EntryPtr> {
  return {
    type: RESELECT,
    payload: ptr
  };
}

export function read(contentBuffer?: Buffer): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (!currentEntry.ptr) {
      return;
    }

    const type = typeFor(currentEntry.ptr.entry);
    if (type.parse) {
      try {
        const content = contentBuffer || await repoActions.getRepo().readFile(currentEntry.ptr.nodeId, currentEntry.ptr.entry);
        const parsedContent = type.parse(content as Buffer);
        dispatch({
          type: READ,
          payload: parsedContent
        });
      } catch (e) {
        console.error(e);
        toastr.error('Read failed', e.message);
      }
    }
  };
}

export function clear(): Action<void> {
  return {
    type: CLEAR
  };
}

export function prepareDelete(): Thunk<void> {
  return (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      dispatch({
        type: PREPARE_DELETE
      });
    }
  };
}

export function confirmDelete(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      await dispatch(repoActions.deleteEntry(currentEntry.ptr));
    }
  };
}

export function cancelDelete() {
  return {
    type: CANCEL_DELETE
  };
}

// when a folder is deselected, clear item selection as well
afterAction(curNodeActions.SELECT, (dispatch, getState: GetState) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr) {
    dispatch(clear());
  }
});
afterAction(curNodeActions.SELECT_SPECIAL, (dispatch, getState: GetState) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr) {
    dispatch(clear());
  }
});

// when a selected entry is renamed, update selection
afterAction(repoActions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(reselect(new EntryPtr(ptr.nodeId, newName)));
  }
});

// when a selected entry is deleted, clear selection
afterAction(repoActions.DELETE_ENTRY, (dispatch, getState: GetState, ptr) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(clear());
  }
});

// when an entry is created within the current folder, select it
afterAction(repoActions.CREATE_ENTRY, (dispatch, getState: GetState, ptr) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === ptr.nodeId) {
    dispatch(select(ptr));
  }
});

// when the current entry is updated, read new content
afterAction(repoActions.UPDATE_ENTRY, (dispatch, getState: GetState, { ptr, buffer }) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(read(buffer));
  }
});

export default function reducer(state: State = {}, action: Action<any>): State {
  switch (action.type) {
    case SELECT:
      if (action.payload instanceof EntryPtr) {
        return { ptr: action.payload };
      }
      return state;
    case RESELECT:
      if (action.payload instanceof EntryPtr) {
        return { ...state, ptr: action.payload, deleting: false };
      }
      return state;
    case READ:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case CLEAR:
      return {};
    case PREPARE_DELETE:
      return { ...state, deleting: true };
    case CANCEL_DELETE:
      return { ...state, deleting: false };
    default:
      return state;
  }
}
