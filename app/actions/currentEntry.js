// @flow
import { EntryPtr } from '../utils/repository';
import { getRepo, deleteEntry, repositoryEvents } from './repository';
import typeFor from '../fileType';

const SELECT = 'currentEntry/SELECT';
const RESELECT = 'currentEntry/RESELECT';
const READ = 'currentEntry/READ';
const CLEAR = 'currentEntry/CLEAR';
const PREPARE_DELETE = 'currentEntry/PREPARE_DELETE';
const CANCEL_DELETE = 'currentEntry/CANCEL_DELETE';

export function select(ptr: EntryPtr) {
  EntryPtr.assert(ptr);
  return async (dispatch, getState) => {
    dispatch({
      type: SELECT,
      payload: ptr
    });

    await dispatch(read());
  };
}

export function reselect(ptr: EntryPtr) {
  EntryPtr.assert(ptr);
  return {
    type: RESELECT,
    payload: ptr
  };
}

export function read(preParsedContent: any) {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (!currentEntry.ptr) {
      return;
    }

    const type = typeFor(currentEntry.ptr.entry);
    if (type.parse) {
      let parsedContent = preParsedContent;
      if (!parsedContent) {
        const content = await getRepo().readFile(currentEntry.ptr.nodeId, currentEntry.ptr.entry);
        parsedContent = type.parse(content);
      }
      dispatch({
        type: READ,
        payload: parsedContent
      });
    }
  };
}

export function clear() {
  return {
    type: CLEAR
  };
}

export function prepareDelete() {
  return (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      dispatch({
        type: PREPARE_DELETE
      });
    }
  };
}

export function confirmDelete() {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      await dispatch(deleteEntry(currentEntry.ptr));
    }
  };
}

export function cancelDelete() {
  return {
    type: CANCEL_DELETE
  };
}

repositoryEvents.on('clearSelection', (dispatch, getState) => {
  dispatch(clear());
});

repositoryEvents.on('rename', (dispatch, getState, ptr, newPtr) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(reselect(newPtr));
  }
});

repositoryEvents.on('delete', (dispatch, getState, ptr) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(clear());
  }
});

export default function reducer(state: { ptr?: EntryPtr, parsedContent?: any } = {}, action: { type: string, payload: any }) {
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
