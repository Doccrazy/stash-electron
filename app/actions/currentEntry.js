// @flow
import fs from 'mz/fs';
import path from 'path';
import { EntryPtr } from '../utils/repository';
import typeFor from '../fileType';

export const SELECT = 'currentEntry/SELECT';
export const READ = 'currentEntry/READ';
export const CLEAR = 'currentEntry/CLEAR';

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
