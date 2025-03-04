import * as fs from 'fs-extra';
import * as sshpk from 'sshpk';
import { toastr } from 'react-redux-toastr';
import { clipboard } from 'electron';
import * as remote from '@electron/remote';
import { GetState, OptionalAction, TypedAction, TypedThunk } from './types/index';
import { FormState, State } from './types/keys';
import { afterAction } from '../store/eventMiddleware';
import * as Repository from './repository';
import KeyProvider, { findUser } from '../repository/KeyProvider';
import { parsePublicKey } from '../utils/rsa';

export enum Actions {
  LOAD = 'keys/LOAD',
  SAVED = 'keys/SAVED',
  ADD = 'keys/ADD',
  DELETE = 'keys/DELETE',
  OPEN_ADD = 'keys/OPEN_ADD',
  CLOSE_ADD = 'keys/CLOSE_ADD',
  VALIDATE = 'keys/VALIDATE',
  CHANGE = 'keys/CHANGE'
}

function load(provider: KeyProvider): Action {
  const keysByUser: State['byUser'] = provider
    .listUsers()
    .reduce((acc, username) => ({ ...acc, [username]: provider.getKey(username) }), {});
  return {
    type: Actions.LOAD,
    payload: keysByUser
  };
}

export function reload(): Action {
  return load(Repository.getKeyProvider());
}

export function save(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { keys } = getState();
    const provider = Repository.getKeyProvider();

    const usersInRepo = provider.listUsers();
    usersInRepo.filter((username) => !Object.keys(keys.edited).includes(username)).forEach((username) => provider.deleteKey(username));
    Object.keys(keys.edited)
      .filter((username) => !provider.listUsers().includes(username))
      .forEach((username) => provider.addKey(username, keys.edited[username]));

    try {
      await provider.save();

      dispatch({
        type: Actions.SAVED
      });
    } catch (e) {
      console.error(e);
      toastr.error('Save failed', e.message);
    }
  };
}

export function addUser(username: string, key: sshpk.Key): Action {
  return {
    type: Actions.ADD,
    payload: {
      username,
      key
    }
  };
}

export function deleteUser(username: string): Action {
  return {
    type: Actions.DELETE,
    payload: username
  };
}

export function openAdd(): Action {
  return {
    type: Actions.OPEN_ADD
  };
}

export function closeAdd(): Action {
  return {
    type: Actions.CLOSE_ADD
  };
}

export function confirmAdd(): Thunk<void> {
  return (dispatch, getState) => {
    const { keys } = getState();

    if (!keys.formState.username || !keys.formState.publicKey) {
      dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: 'Please enter username and key.' } });
      return;
    }

    if (Object.keys(keys.edited).includes(keys.formState.username)) {
      dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: 'Duplicate username.' } });
      return;
    }

    try {
      const key = parsePublicKey(keys.formState.publicKey);

      if (keys.formState.keyName) {
        key.comment = keys.formState.keyName;
      }

      const existingUser = findUser(keys.edited, key);
      if (existingUser) {
        dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: `Duplicate key: Already used by ${existingUser}.` } });
        return;
      }

      dispatch(addUser(keys.formState.username, key));
      dispatch(closeAdd());
    } catch (e) {
      console.error(e);
      dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: `Invalid key: ${e.message}.` } });
    }
  };
}

export function change(formState: FormState): Thunk<void> {
  return (dispatch, getState) => {
    const { keys } = getState();

    dispatch({
      type: Actions.CHANGE,
      payload: formState
    });

    if (formState.publicKey && keys.formState.publicKey !== formState.publicKey) {
      try {
        parsePublicKey(formState.publicKey);
      } catch (e) {
        if (e instanceof sshpk.KeyEncryptedError) {
          dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: `Encrypted keys are not supported here.` } });
        } else {
          dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: `Invalid key: ${e.message}.` } });
        }
        return;
      }
    }

    if (!formState.username || !formState.publicKey) {
      dispatch({
        type: Actions.VALIDATE,
        payload: {
          valid: false
        }
      });
      return;
    }

    if (!/^[\p{Letter}\w.@-](?: ?[\p{Letter}\w.@-])+$/u.test(formState.username) || formState.username.length > 50) {
      dispatch({ type: Actions.VALIDATE, payload: { valid: false, message: 'Invalid username.' } });
      return;
    }

    dispatch({
      type: Actions.VALIDATE,
      payload: {
        valid: true
      }
    });
  };
}

export function browseLoadKey(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { keys } = getState();

    const files = (
      await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title: 'Select public key',
        properties: ['openFile']
      })
    ).filePaths;
    if (files && files[0]) {
      const publicKey = await fs.readFile(files[0], 'utf8');
      dispatch(change({ ...keys.formState, publicKey }));
    }
  };
}

export function loadPrivateKey(): Thunk<void> {
  return (dispatch, getState) => {
    const { keys, privateKey } = getState();

    if (!privateKey.key) {
      return;
    }

    dispatch(change({ ...keys.formState, publicKey: privateKey.key.toPublic().toString('ssh') }));
  };
}

export function copyToClipboard(username: string): Thunk<void> {
  return (dispatch, getState) => {
    const { keys } = getState();
    clipboard.writeText(keys.edited[username].toString('ssh'));
    toastr.success('', `Public key of ${username} copied to clipboard`, { timeOut: 2000 });
  };
}

afterAction(Repository.Actions.FINISH_LOAD, (dispatch, getState: GetState) => {
  dispatch(load(Repository.getKeyProvider()));
});

type Action =
  | TypedAction<Actions.LOAD, State['byUser']>
  | OptionalAction<Actions.SAVED>
  | TypedAction<Actions.ADD, { username: string; key: sshpk.Key }>
  | TypedAction<Actions.DELETE, string>
  | OptionalAction<Actions.OPEN_ADD>
  | OptionalAction<Actions.CLOSE_ADD>
  | TypedAction<Actions.VALIDATE, { valid: boolean; message?: string }>
  | TypedAction<Actions.CHANGE, FormState>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { byUser: {}, edited: {}, formState: {} }, action: Action): State {
  switch (action.type) {
    case Actions.LOAD:
      return { byUser: { ...action.payload }, edited: { ...action.payload }, formState: {} };
    case Actions.SAVED:
      return { ...state, byUser: { ...state.edited }, modified: false, valid: true };
    case Actions.ADD: {
      const newKeysByUser = { ...state.edited, [action.payload.username]: action.payload.key };
      return { ...state, edited: newKeysByUser, modified: true };
    }
    case Actions.DELETE: {
      const newKeysByUser = { ...state.edited };
      delete newKeysByUser[action.payload];
      return { ...state, edited: newKeysByUser, modified: true };
    }
    case Actions.OPEN_ADD:
      return { ...state, addOpen: true, formState: {}, valid: false };
    case Actions.CLOSE_ADD:
      return { ...state, addOpen: false, feedback: undefined };
    case Actions.VALIDATE:
      return { ...state, valid: action.payload.valid, feedback: action.payload.message };
    case Actions.CHANGE:
      return { ...state, formState: action.payload };
    default:
      return state;
  }
}
