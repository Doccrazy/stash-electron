import fs from 'fs-extra';
import path from 'path';
import { shell } from 'electron';
import { EntryPtr } from '../utils/repository';
import typeFor from '../fileType';
import { read as readCurrentEntry } from './currentEntry';

const OPEN = 'edit/OPEN';
const CLOSE = 'edit/CLOSE';
const VALIDATE = 'edit/VALIDATE';
const SAVED = 'edit/SAVED';
const CHANGE = 'edit/CHANGE';
const CHANGE_STATE = 'edit/CHANGE_STATE';

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
          parsedContent,
          formState: (type.form && type.form.initFormState) ? type.form.initFormState(parsedContent) : undefined
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

export function changeState(newState) {
  return {
    type: CHANGE_STATE,
    payload: newState
  };
}

export function save(closeAfter) {
  return async (dispatch, getState) => {
    const { repository, edit, currentEntry } = getState();
    const absPath = path.join(repository.path, edit.ptr.nodeId, edit.ptr.entry);

    const type = typeFor(edit.ptr.entry);
    if (type.form && type.form.validate) {
      const validationError = type.form.validate(edit.parsedContent, edit.formState);
      dispatch({
        type: VALIDATE,
        payload: validationError
      });
      if (validationError) {
        return;
      }
    }
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

export default function reducer(state = {}, action) {
  switch (action.type) {
    case OPEN:
      if (action.payload.ptr && action.payload.parsedContent) {
        return {
          ptr: action.payload.ptr,
          parsedContent: action.payload.parsedContent,
          formState: action.payload.formState
        };
      }
      return state;
    case CHANGE:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case CHANGE_STATE:
      if (action.payload) {
        return { ...state, formState: action.payload };
      }
      return state;
    case VALIDATE:
      return { ...state, validationError: action.payload };
    case CLOSE:
      return {};
    default:
      return state;
  }
}
