import { fromJS, is } from 'immutable';
import { toastr } from 'react-redux-toastr';
import { cleanFileName, hasChildOrEntry, isAccessible, isValidFileName, RESERVED_FILENAMES } from '../utils/repository';
import EntryPtr from '../domain/EntryPtr';
import { rendererById, Type, typeById, typeFor } from '../fileType';
import * as Repository from './repository';
import { afterAction } from '../store/eventMiddleware';
import { State } from './types/edit';
import { GetState, OptionalAction, TypedAction, TypedThunk } from './types/index';

export enum Actions {
  OPEN = 'edit/OPEN',
  REPOINT_OPEN = 'edit/REPOINT_OPEN',
  CLOSE = 'edit/CLOSE',
  VALIDATE = 'edit/VALIDATE',
  SAVED = 'edit/SAVED',
  CHANGE = 'edit/CHANGE',
  CHANGE_STATE = 'edit/CHANGE_STATE',
  CHANGE_NAME = 'edit/CHANGE_NAME'
}

export function open(ptr: EntryPtr, preParsedContent?: any, knownType?: Type<any>): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    if (!isAccessible(getState().repository.nodes, ptr.nodeId, getState().privateKey.username)) {
      return;
    }

    const type = knownType || typeFor(ptr.entry);
    let parsedContent;
    if (type.parse) {
      parsedContent = preParsedContent;
      if (!parsedContent) {
        try {
          const content = await Repository.getRepo().readFile(ptr.nodeId, ptr.entry);
          parsedContent = type.parse(content);
        } catch (e) {
          // failed to read
          console.error(e);
          toastr.error('', `Failed to open entry ${ptr.entry}: ${e}`);
          return;
        }
      }
    }

    const renderer = rendererById(type.id);
    dispatch({
      type: Actions.OPEN,
      payload: {
        ptr,
        typeId: type.id,
        parsedContent,
        formState: renderer.Form.initFormState ? renderer.Form.initFormState(parsedContent) : undefined
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

export function create(nodeId: string, typeId: string): Thunk<void> {
  return (dispatch, getState) => {
    const type = typeById(typeId);
    if (!type || !type.initialize) {
      throw new Error(`invalid type ${typeId} passed to create`);
    }

    dispatch(open(new EntryPtr(nodeId, ''), type.initialize(), type));
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

export function repointOpen(ptr: EntryPtr): Action {
  return {
    type: Actions.REPOINT_OPEN,
    payload: ptr
  };
}

export function close(): Action {
  return {
    type: Actions.CLOSE
  };
}

export function change(updatedContent: any): Action {
  return {
    type: Actions.CHANGE,
    payload: updatedContent
  };
}

export function changeState(newState: any): Action {
  return {
    type: Actions.CHANGE_STATE,
    payload: newState
  };
}

export function changeName(name: string): Action {
  return {
    type: Actions.CHANGE_NAME,
    payload: cleanFileName(name)
  };
}

export function save(closeAfter: boolean): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository, edit } = getState();
    if (!edit.ptr || !edit.typeId) {
      return;
    }
    const node = repository.nodes[edit.ptr.nodeId];

    // validate new name
    const newName = edit.name ? edit.name.trim() : edit.name;
    if (!edit.ptr.entry || newName !== edit.ptr.entry) {
      if (!isValidFileName(newName)) {
        dispatch({
          type: Actions.VALIDATE,
          payload: 'Name must be provided and cannot contain / \\ : * ? " < > |.'
        });
        return;
      }
      if (RESERVED_FILENAMES.includes(newName.toLowerCase())) {
        dispatch({
          type: Actions.VALIDATE,
          payload: 'This filename is reserved for internal use.'
        });
        return;
      }
      if (newName.toLowerCase() !== edit.ptr.entry.toLowerCase() && hasChildOrEntry(repository.nodes, node, newName)) {
        dispatch({
          type: Actions.VALIDATE,
          payload: 'An entry with this name already exists.'
        });
        return;
      }
    }

    // validate content
    const type = typeById(edit.typeId);
    const renderer = rendererById(type.id);
    if (renderer.Form.validate) {
      const validationError = renderer.Form.validate(newName, edit.parsedContent, edit.formState);
      dispatch({
        type: Actions.VALIDATE,
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

      const savedEntryPtr = new EntryPtr(edit.ptr.nodeId, fileName);
      try {
        await dispatch(Repository.writeEntry(savedEntryPtr, buffer));
      } catch (e) {
        // failed to read
        console.error(e);
        toastr.error('', `Failed to write entry ${fileName}: ${e}`);
        return;
      }

      dispatch({
        type: Actions.SAVED,
        payload: {
          ptr: savedEntryPtr,
          isNew: !edit.ptr.entry
        }
      });
    }

    // rename
    if (edit.ptr.entry && newName !== edit.ptr.entry) {
      await dispatch(Repository.rename(edit.ptr, newName));
    }

    if (closeAfter) {
      dispatch(close());
    }
  };
}

afterAction(Repository.Actions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }) => {
  const { edit } = getState();
  if (edit.ptr && edit.ptr.equals(ptr)) {
    dispatch(repointOpen(new EntryPtr(ptr.nodeId, newName)));
  }
});

afterAction(
  [Repository.Actions.DELETE_ENTRY, Repository.Actions.MOVE_ENTRY],
  (dispatch, getState: GetState, { ptr }: { ptr: EntryPtr }) => {
    const { edit } = getState();
    if (edit.ptr && edit.ptr.equals(ptr)) {
      dispatch(close());
    }
  }
);

type Action =
  | TypedAction<Actions.OPEN, { ptr: EntryPtr; typeId?: string; parsedContent?: any; formState?: any }>
  | TypedAction<Actions.REPOINT_OPEN, EntryPtr>
  | OptionalAction<Actions.CLOSE>
  | TypedAction<Actions.VALIDATE, string | boolean>
  | TypedAction<Actions.SAVED, { ptr: EntryPtr; isNew: boolean }>
  | TypedAction<Actions.CHANGE, any>
  | TypedAction<Actions.CHANGE_STATE, any>
  | TypedAction<Actions.CHANGE_NAME, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
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
    case Actions.REPOINT_OPEN:
      if (action.payload) {
        return { ...state, ptr: action.payload };
      }
      return state;
    case Actions.CHANGE:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case Actions.CHANGE_STATE:
      if (action.payload) {
        return { ...state, formState: action.payload };
      }
      return state;
    case Actions.CHANGE_NAME:
      return { ...state, name: action.payload };
    case Actions.VALIDATE: {
      const msg = typeof action.payload === 'boolean' ? (action.payload ? 'Validation failed.' : undefined) : action.payload;
      return { ...state, validationError: msg };
    }
    case Actions.CLOSE:
      return {};
    default:
      return state;
  }
}
