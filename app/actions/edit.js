import fs from 'mz/fs';
import path from 'path';
import { shell } from 'electron';
import { EntryPtr } from '../utils/repository';
import typeFor from '../fileType';
import { read as readCurrentEntry } from './currentEntry';

export const OPEN = 'edit/OPEN';
export const CLOSE = 'edit/CLOSE';
export const SAVED = 'edit/SAVED';
export const CHANGE = 'edit/CHANGE';

export function open(ptr, preParsedContent) {
  EntryPtr.assert(ptr);
  return async (dispatch, getState) => {
    const { repository } = getState();
    const absPath = path.join(repository.path, ptr.nodeId, ptr.entry);

    const type = typeFor(ptr.entry);
    if (type.parse) {
      let parsedContent = preParsedContent;
      if (!parsedContent) {
        const content = await fs.readFile(absPath);
        parsedContent = type.parse(content);
      }

      dispatch({
        type: OPEN,
        payload: {
          ptr,
          parsedContent
        }
      });
    } else {
      shell.openItem(absPath);
    }
  };
}

export function openCurrent() {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      await dispatch(open(currentEntry.ptr, currentEntry.parsedContent));
    }
  };
}

export function close() {
  return {
    type: CLOSE
  };
}

export function change(updatedContent) {
  return {
    type: CHANGE,
    payload: updatedContent
  };
}

export function save(closeAfter) {
  return async (dispatch, getState) => {
    const { repository, edit, currentEntry } = getState();
    const absPath = path.join(repository.path, edit.ptr.nodeId, edit.ptr.entry);

    const type = typeFor(edit.ptr.entry);
    if (type.parse) {
      const buffer = type.write(edit.parsedContent);
      await fs.writeFile(absPath, buffer);

      dispatch({
        type: SAVED
      });

      if (currentEntry.ptr && currentEntry.ptr.equals(edit.ptr)) {
        dispatch(readCurrentEntry(edit.parsedContent));
      }

      if (closeAfter) {
        dispatch(close());
      }
    }
  };
}
