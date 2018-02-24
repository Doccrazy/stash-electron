import EntryPtr from '../domain/EntryPtr';
import { findHistoricEntry } from '../store/selectors';
import { accessingRepository, createGitRepository } from '../utils/git';
import * as Repository from './repository';
import * as CurrentNode from './currentNode';
import * as PrivateKey from './privateKey';
import { afterAction } from '../store/eventMiddleware';
import typeFor from '../fileType';
import {State} from './types/currentEntry';
import { GetState, TypedAction, TypedThunk, OptionalAction, RootState } from './types/index';
import {toastr} from 'react-redux-toastr';
import {isAccessible} from '../utils/repository';

export enum Actions {
  SELECT = 'currentEntry/SELECT',
  RESELECT = 'currentEntry/RESELECT',
  SELECT_HISTORY = 'currentEntry/SELECT_HISTORY',
  READ = 'currentEntry/READ',
  CLEAR = 'currentEntry/CLEAR',
  PREPARE_DELETE = 'currentEntry/PREPARE_DELETE',
  CANCEL_DELETE = 'currentEntry/CANCEL_DELETE'
}

export function select(ptr: EntryPtr): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const node = repository.nodes[ptr.nodeId];
    if (!node || !node.entries || !node.entries.includes(ptr.entry)) {
      return;
    }

    dispatch({
      type: Actions.SELECT,
      payload: ptr
    });

    await dispatch(read());
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
    if (!currentEntry.ptr || (!currentEntry.historyCommit && !isAccessible(repository.nodes, currentEntry.ptr.nodeId, privateKey.username))) {
      return;
    }

    const type = typeFor(currentEntry.ptr.entry);
    if (type.parse) {
      try {
        const content = contentBuffer || (currentEntry.historyCommit
          ? await readFromGit(getState(), currentEntry.ptr, currentEntry.historyCommit)
          : await Repository.getRepo().readFile(currentEntry.ptr.nodeId, currentEntry.ptr.entry));
        const parsedContent = type.parse(content as Buffer);
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
  return accessingRepository(state.repository.path!, async gitRepo => {
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
afterAction([Repository.Actions.DELETE_ENTRY, Repository.Actions.MOVE_ENTRY], (dispatch, getState: GetState, { ptr }: { ptr: EntryPtr }) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(clear());
  }
});

// when an entry is created within the current folder, select it
afterAction(Repository.Actions.CREATE_ENTRY, (dispatch, getState: GetState, ptr) => {
  const { currentNode } = getState();
  if (currentNode.nodeId === ptr.nodeId) {
    dispatch(select(ptr));
  }
});

// when the current entry is updated, read new content
afterAction(Repository.Actions.UPDATE_ENTRY, (dispatch, getState: GetState, { ptr, buffer }) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr && currentEntry.ptr.equals(ptr)) {
    dispatch(read(buffer));
  }
});

// when the login state changes, re-read current entry
afterAction(PrivateKey.Actions.LOGIN, (dispatch, getState: GetState) => {
  const { currentEntry } = getState();
  if (currentEntry.ptr) {
    dispatch(read());
  }
});

type Action =
  TypedAction<Actions.SELECT, EntryPtr>
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
