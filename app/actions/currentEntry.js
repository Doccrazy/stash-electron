// @flow
import fs from 'fs-extra';
import path from 'path';
import { EntryPtr } from '../utils/repository';
import { repositoryEvents } from './repository';
import typeFor from '../fileType';

const SELECT = 'currentEntry/SELECT';
const RESELECT = 'currentEntry/RESELECT';
const READ = 'currentEntry/READ';
const CLEAR = 'currentEntry/CLEAR';

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
      const { repository } = getState();

      let parsedContent = preParsedContent;
      if (!parsedContent) {
        const content = await fs.readFile(path.join(repository.path, currentEntry.ptr.nodeId, currentEntry.ptr.entry));
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

repositoryEvents.on('clearSelection', (dispatch, getState) => {
  dispatch(clear());
});

repositoryEvents.on('rename', (dispatch, getState, ptr, newPtr) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(reselect(newPtr));
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
        return { ...state, ptr: action.payload };
      }
      return state;
    case READ:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case CLEAR:
      return {};
    default:
      return state;
  }
}
