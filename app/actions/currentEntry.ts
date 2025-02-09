import { clipboard, shell } from 'electron';
import { toastr } from 'react-redux-toastr';
import EntryPtr from '../domain/EntryPtr';
import { Type, typeFor, WellKnownField } from '../fileType';
import { afterAction } from '../store/eventMiddleware';
import { findHistoricEntry } from '../store/selectors';
import { sanitizeUrl } from '../utils/format';
import { accessingRepository, createGitRepository } from '../utils/git';
import { t } from '../utils/i18n/redux';
import { isAccessible } from '../utils/repository';
import * as CurrentNode from './currentNode';
import * as PrivateKey from './privateKey';
import * as Repository from './repository';
import { State } from './types/currentEntry';
import { Dispatch, GetState, OptionalAction, RootState, TypedAction, TypedThunk } from './types/index';

export enum Actions {
  SELECT = 'currentEntry/SELECT',
  RESELECT = 'currentEntry/RESELECT',
  SELECT_HISTORY = 'currentEntry/SELECT_HISTORY',
  READ = 'currentEntry/READ',
  CLEAR = 'currentEntry/CLEAR',
  PREPARE_DELETE = 'currentEntry/PREPARE_DELETE',
  CANCEL_DELETE = 'currentEntry/CANCEL_DELETE'
}

export function select(ptr: EntryPtr): Thunk<Promise<boolean>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[ptr.nodeId];
    if (!node || !node.entries || !node.entries.includes(ptr.entry)) {
      return false;
    }

    dispatch({
      type: Actions.SELECT,
      payload: ptr
    });

    await dispatch(read());
    return true;
  };
}

export function reselect(ptr: EntryPtr): Action {
  return {
    type: Actions.RESELECT,
    payload: ptr
  };
}

export function selectHistory(oid?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    if (!getState().currentEntry.ptr) {
      return;
    }

    dispatch({
      type: Actions.SELECT_HISTORY,
      payload: oid
    });

    await dispatch(read());
  };
}

export function read(contentBuffer?: Buffer): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentEntry, repository, privateKey } = getState();
    if (
      !currentEntry.ptr ||
      (!currentEntry.historyCommit && !isAccessible(repository.nodes, currentEntry.ptr.nodeId, privateKey.username))
    ) {
      return;
    }

    const type = typeFor(currentEntry.ptr.entry);
    if (type.parse) {
      try {
        const content =
          contentBuffer ||
          (currentEntry.historyCommit
            ? await readFromGit(getState(), currentEntry.ptr, currentEntry.historyCommit)
            : await Repository.getRepo().readFile(currentEntry.ptr.nodeId, currentEntry.ptr.entry));
        const parsedContent = type.parse(content);
        dispatch({
          type: Actions.READ,
          payload: parsedContent
        });
      } catch (e) {
        console.error(e);
        toastr.error('Read failed', e.message);
      }
    }
  };
}

// TODO this does not belong here
function readFromGit(state: RootState, ptr: EntryPtr, commitOid: string): Promise<Buffer> {
  const ptrAtCommit = findHistoricEntry(ptr, state.git.history, commitOid);
  return accessingRepository(state.repository.path!, async (gitRepo) => {
    const repo = await createGitRepository(gitRepo, commitOid, state.privateKey.key);

    return repo.readFile(ptrAtCommit.nodeId, ptrAtCommit.entry);
  });
}

export function clear(): Action {
  return {
    type: Actions.CLEAR
  };
}

export function prepareDelete(ptr?: EntryPtr): Thunk<void> {
  return (dispatch, getState) => {
    const { currentEntry } = getState();
    ptr = ptr || currentEntry.ptr;
    if (ptr) {
      dispatch({
        type: Actions.PREPARE_DELETE,
        payload: ptr
      });
    }
  };
}

export function confirmDelete(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { currentEntry } = getState();
    if (currentEntry.deleting) {
      await dispatch(Repository.deleteEntry(currentEntry.deleting));
      dispatch(closeDelete());
    }
  };
}

export function closeDelete(): Action {
  return {
    type: Actions.CANCEL_DELETE
  };
}

export function copyToClipboard(field: WellKnownField, ptr?: EntryPtr): Thunk<Promise<void>> {
  return withEntryOrCurrent(ptr, (type, content) => {
    if (!type.readField) {
      return;
    }
    const value = type.readField(content, field);
    if (value) {
      copyToClip(t(`common.WellKnownField.${WellKnownField[field]}`), value);
    }
  });
}

let timeout: NodeJS.Timer | null;
export function copyToClip(name: string, text: string) {
  clipboard.writeText(text);
  if (timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  timeout = setTimeout(() => {
    if (clipboard.readText() === text) {
      clipboard.clear();
    }
  }, 30000);
  toastr.success('', `${name} copied`, { timeOut: 2000 });
}

export function openUrl(ptr?: EntryPtr): Thunk<Promise<void>> {
  return withEntryOrCurrent(ptr, (type, content) => {
    if (!type.readField) {
      return;
    }
    const url = type.readField(content, WellKnownField.URL);
    if (url) {
      shell.openExternal(sanitizeUrl(url));
    }
  });
}

export function withEntryOrCurrent(
  ptr: EntryPtr | undefined,
  cb: (type: Type<any>, content: any, ptr: EntryPtr, dispatch: Dispatch, getState: () => RootState) => void | Promise<void>
): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    let parsedContent: any;
    let type: Type<any>;
    let entryPtr: EntryPtr;
    if (ptr) {
      entryPtr = ptr;
      const content = await Repository.getRepo().readFile(ptr.nodeId, ptr.entry);
      type = typeFor(ptr.entry);
      if (!type.parse) {
        return;
      }
      parsedContent = type.parse(content);
    } else {
      const { currentEntry } = getState();
      if (!currentEntry.ptr) {
        return;
      }
      entryPtr = currentEntry.ptr;
      if (!currentEntry.parsedContent) {
        await dispatch(read());
      }
      if (!currentEntry.parsedContent) {
        return;
      }
      parsedContent = currentEntry.parsedContent;
      type = typeFor(currentEntry.ptr.entry);
    }

    await cb(type, parsedContent, entryPtr, dispatch, getState);
  };
}

// when a folder is deselected, clear item selection as well
afterAction(CurrentNode.Actions.SELECT, (dispatch, getState: GetState) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr) {
    dispatch(clear());
  }
});
afterAction(CurrentNode.Actions.SELECT_SPECIAL, (dispatch, getState: GetState) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr) {
    dispatch(clear());
  }
});

// when a selected entry is renamed, update selection
afterAction(Repository.Actions.RENAME_ENTRY, (dispatch, getState: GetState, { ptr, newName }) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(reselect(new EntryPtr(ptr.nodeId, newName)));
  }
});

// when a selected entry is deleted, clear selection
afterAction(
  [Repository.Actions.DELETE_ENTRY, Repository.Actions.MOVE_ENTRY],
  (dispatch, getState: GetState, { ptr }: { ptr: EntryPtr }) => {
    const { currentEntry } = getState();
    if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
      dispatch(clear());
    }
  }
);

// when an entry is created within the current folder, select it
afterAction(Repository.Actions.CREATE_ENTRY, (dispatch: Dispatch, getState: GetState, ptr) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === ptr.nodeId) {
    dispatch(select(ptr));
  }
});

// when the current entry is updated, read new content
afterAction(Repository.Actions.UPDATE_ENTRY, (dispatch: Dispatch, getState: GetState, { ptr, buffer }) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(read(buffer));
  }
});

// when the login state changes, re-read current entry
afterAction(PrivateKey.Actions.LOGIN, (dispatch: Dispatch, getState: GetState) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr) {
    dispatch(read());
  }
});

type Action =
  | TypedAction<Actions.SELECT, EntryPtr>
  | TypedAction<Actions.RESELECT, EntryPtr>
  | OptionalAction<Actions.SELECT_HISTORY, string>
  | TypedAction<Actions.READ, any>
  | OptionalAction<Actions.CLEAR>
  | OptionalAction<Actions.PREPARE_DELETE, EntryPtr>
  | OptionalAction<Actions.CANCEL_DELETE>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.SELECT:
      if (action.payload instanceof EntryPtr) {
        return { ptr: action.payload };
      }
      return state;
    case Actions.RESELECT:
      if (action.payload instanceof EntryPtr) {
        return { ...state, ptr: action.payload, deleting: undefined, historyCommit: undefined };
      }
      return state;
    case Actions.SELECT_HISTORY:
      return { ...state, historyCommit: action.payload, parsedContent: undefined };
    case Actions.READ:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case Actions.CLEAR:
      return {};
    case Actions.PREPARE_DELETE:
      return { ...state, deleting: action.payload };
    case Actions.CANCEL_DELETE:
      return { ...state, deleting: undefined };
    default:
      return state;
  }
}
