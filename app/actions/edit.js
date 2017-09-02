import fs from 'fs-extra';
import path from 'path';
import { shell } from 'electron';
import { fromJS, is } from 'immutable';
import { EntryPtr, isValidFileName } from '../utils/repository';
import typeFor, { typeById } from '../fileType';
import * as current from './currentEntry';
import { rename, createEntry, deleteEntry, repositoryEvents } from './repository';

const OPEN = 'edit/OPEN';
const REPOINT_OPEN = 'edit/REPOINT_OPEN';
const CLOSE = 'edit/CLOSE';
const VALIDATE = 'edit/VALIDATE';
const SAVED = 'edit/SAVED';
const CHANGE = 'edit/CHANGE';
const CHANGE_STATE = 'edit/CHANGE_STATE';
const CHANGE_NAME = 'edit/CHANGE_NAME';

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
          typeId: type.id,
          name: ptr.entry,
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

export function create(nodeId, typeId) {
  const type = typeById(typeId);
  if (!type) {
    return;
  }

  const parsedContent = type.initialize();

  return {
    type: OPEN,
    payload: {
      ptr: new EntryPtr(nodeId),
      typeId,
      name: '',
      parsedContent,
      formState: (type.form && type.form.initFormState) ? type.form.initFormState(parsedContent) : undefined
    }
  };
}

export function repointOpen(ptr) {
  EntryPtr.assert(ptr);
  return {
    type: REPOINT_OPEN,
    payload: {
      ptr,
    }
  };
}

export function deleteCurrent() {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      await dispatch(deleteEntry(currentEntry.ptr));
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

export function changeName(name) {
  return {
    type: CHANGE_NAME,
    payload: name
  };
}

export function save(closeAfter) {
  return async (dispatch, getState) => {
    const { repository, edit, currentEntry } = getState();
    const node = repository.nodes[edit.ptr.nodeId];

    // validate new name
    if (!edit.ptr.entry || edit.name !== edit.ptr.entry) {
      if (!isValidFileName(edit.name)) {
        dispatch({
          type: VALIDATE,
          payload: 'Name must be provided and cannot contain / \\ : * ? " < > |.'
        });
        return;
      }
      if (node.entries.find(e => e === edit.name)) {
        dispatch({
          type: VALIDATE,
          payload: 'An entry with this name already exists.'
        });
        return;
      }
    }

    // validate content
    const type = typeById(edit.typeId);
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

    // save content
    if (type.parse && !is(fromJS(edit.parsedContent), edit.initialContent)) {
      const absPath = path.join(repository.path, edit.ptr.nodeId, edit.ptr.entry || edit.name);
      const buffer = type.write(edit.parsedContent);
      await fs.writeFile(absPath, buffer);

      dispatch({
        type: SAVED
      });

      if (currentEntry.ptr && currentEntry.ptr.equals(edit.ptr)) {
        dispatch(current.read(edit.parsedContent));
      } else if (!edit.ptr.entry) {
        const newPtr = new EntryPtr(edit.ptr.nodeId, edit.name);
        dispatch(createEntry(newPtr));
        if (repository.selected === edit.ptr.nodeId) {
          dispatch(current.select(newPtr));
        }
      }
    }

    // rename
    if (edit.ptr.entry && edit.name !== edit.ptr.entry) {
      dispatch(rename(edit.ptr, edit.name));
    }

    if (closeAfter) {
      dispatch(close());
    }
  };
}

repositoryEvents.on('rename', (dispatch, getState, ptr, newPtr) => {
  const { edit } = getState();
  if (edit.ptr && edit.ptr.equals(ptr)) {
    dispatch(repointOpen(newPtr));
  }
});

repositoryEvents.on('delete', (dispatch, getState, ptr) => {
  const { edit } = getState();
  if (edit.ptr && edit.ptr.equals(ptr)) {
    dispatch(close());
  }
});

export default function reducer(state = {}, action) {
  switch (action.type) {
    case OPEN:
      if (action.payload.ptr && action.payload.parsedContent) {
        return {
          ptr: action.payload.ptr,
          typeId: action.payload.typeId,
          name: action.payload.name,
          initialContent: fromJS(action.payload.parsedContent),
          parsedContent: action.payload.parsedContent,
          formState: action.payload.formState
        };
      }
      return state;
    case REPOINT_OPEN:
      if (action.payload.ptr) {
        return { ...state, ptr: action.payload.ptr };
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
    case CHANGE_NAME:
      return { ...state, name: action.payload };
    case VALIDATE:
      return { ...state, validationError: action.payload };
    case CLOSE:
      return {};
    default:
      return state;
  }
}
