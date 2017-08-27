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

    const type = typeFor(ptr.entry);
    if (type.parser) {
      const { repository } = getState();

      const content = await fs.readFile(path.join(repository.path, ptr.nodeId, ptr.entry));
      const parsedContent = type.parser(content);
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
