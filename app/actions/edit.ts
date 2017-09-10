import { fromJS, is } from 'immutable';
import { cleanFileName, hasChildOrEntry, isValidFileName } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import typeFor, { typeById } from '../fileType';
import * as repoActions from './repository';
import { afterAction } from '../store/eventMiddleware';
import {State} from './types/edit';
import {Action, GetState, Thunk} from './types/index';

const OPEN = 'edit/OPEN';
const REPOINT_OPEN = 'edit/REPOINT_OPEN';
const CLOSE = 'edit/CLOSE';
const VALIDATE = 'edit/VALIDATE';
const SAVED = 'edit/SAVED';
const CHANGE = 'edit/CHANGE';
const CHANGE_STATE = 'edit/CHANGE_STATE';
const CHANGE_NAME = 'edit/CHANGE_NAME';

export function open(ptr: EntryPtr, preParsedContent?: any): Thunk<Promise<void>> {
  EntryPtr.assert(ptr);
  return async (dispatch, getState) => {
    const type = typeFor(ptr.entry);
    let parsedContent;
    if (type.parse) {
      parsedContent = preParsedContent;
      if (!parsedContent) {
        const content = await repoActions.getRepo().readFile(ptr.nodeId, ptr.entry);
        parsedContent = type.parse(content);
      }
    }

    dispatch({
      type: OPEN,
      payload: {
        ptr,
        typeId: type.id,
        parsedContent,
        formState: (type.form && type.form.initFormState) ? type.form.initFormState(parsedContent) : undefined
      }
    });
  };
}

export function openCurrent(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr) {
      await dispatch(open(currentEntry.ptr, currentEntry.parsedContent));
    }
  };
}

export function create(nodeId: string, typeId: string): Action<any> {
  const type = typeById(typeId);
  if (!type || !type.initialize) {
    throw new Error(`invalid type ${typeId} passed to create`);
  }

  const parsedContent = type.initialize();

  return {
    type: OPEN,
    payload: {
      ptr: new EntryPtr(nodeId, ''),
      typeId,
      parsedContent,
      formState: (type.form && type.form.initFormState) ? type.form.initFormState(parsedContent) : undefined
    }
  };
}

export function createInCurrent(typeId: string): Thunk<void> {
  return (dispatch, getState) => {
    const { currentNode } = getState();
    if (currentNode.nodeId) {
      dispatch(create(currentNode.nodeId, typeId));
    }
  };
}

export function repointOpen(ptr: EntryPtr): Action<EntryPtr> {
  EntryPtr.assert(ptr);
  return {
    type: REPOINT_OPEN,
    payload: ptr
  };
}

export function close() {
  return {
    type: CLOSE
  };
}

export function change(updatedContent: any): Action<any> {
  return {
    type: CHANGE,
    payload: updatedContent
  };
}

export function changeState(newState: any): Action<any> {
  return {
    type: CHANGE_STATE,
    payload: newState
  };
}

export function changeName(name: string): Action<string> {
  return {
    type: CHANGE_NAME,
    payload: cleanFileName(name)
  };
}

export function save(closeAfter: boolean): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, edit } = getState();
    if (!edit.ptr) {
      return;
    }
    const node = repository.nodes[edit.ptr.nodeId];

    // validate new name
    const newName = edit.name ? edit.name.trim() : edit.name;
    if (!edit.ptr.entry || newName !== edit.ptr.entry) {
      if (!isValidFileName(newName)) {
        dispatch({
          type: VALIDATE,
          payload: 'Name must be provided and cannot contain / \\ : * ? " < > |.'
        });
        return;
      }
      if (hasChildOrEntry(repository.nodes, node, newName)) {
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
      const validationError = type.form.validate(newName, edit.parsedContent, edit.formState);
      dispatch({
        type: VALIDATE,
        payload: validationError
      });
      if (validationError) {
        return;
      }
    }

    // save content
    if (type.write && !is(fromJS(edit.parsedContent), edit.initialContent)) {
      const fileName = edit.ptr.entry || newName;
      const buffer = type.write(edit.parsedContent);

      dispatch(repoActions.writeEntry(new EntryPtr(edit.ptr.nodeId, fileName), buffer));

      dispatch({
        type: SAVED
      });
    }

    // rename
    if (edit.ptr.entry && newName !== edit.ptr.entry) {
      dispatch(repoActions.rename(edit.ptr, newName));
    }

    if (closeAfter) {
      dispatch(close());
    }
  };
}

afterAction(repoActions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }) => {
  const { edit } = getState();
  if (edit.ptr && edit.ptr.equals(ptr)) {
    dispatch(repointOpen(new EntryPtr(ptr.nodeId, newName)));
  }
});

afterAction(repoActions.DELETE_ENTRY, (dispatch, getState: GetState, ptr) => {
  const { edit } = getState();
  if (edit.ptr && edit.ptr.equals(ptr)) {
    dispatch(close());
  }
});

export default function reducer(state: State = {}, action: Action<any>): State {
  switch (action.type) {
    case OPEN:
      if (action.payload.ptr) {
        return {
          ptr: action.payload.ptr,
          typeId: action.payload.typeId,
          name: action.payload.ptr.entry || '',
          initialContent: action.payload.parsedContent ? fromJS(action.payload.parsedContent) : undefined,
          parsedContent: action.payload.parsedContent,
          formState: action.payload.formState
        };
      }
      return state;
    case REPOINT_OPEN:
      if (action.payload) {
        return { ...state, ptr: action.payload };
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
