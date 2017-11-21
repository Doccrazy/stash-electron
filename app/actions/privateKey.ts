import * as fs from 'fs-extra';
import * as path from 'path';
import * as sshpk from 'sshpk';
import {toastr} from 'react-redux-toastr';
import {GetState, OptionalAction, TypedAction, TypedThunk} from './types/index';
import {KeyError, State} from './types/privateKey';
import {afterAction} from '../store/eventMiddleware';
import * as Settings from './settings';
import { requestCredentials, acceptCredentials, rejectCredentials, clearStoredLogin } from './credentials';
import {parsePrivateKey} from '../utils/rsa';
import * as Keys from './keys';
import * as Repository from './repository';
import {findUser} from '../repository/KeyProvider';

export enum Actions {
  LOAD = 'privateKey/LOAD',
  ERROR = 'privateKey/ERROR',
  LOCK = 'privateKey/LOCK',
  LOGIN = 'privateKey/LOGIN'
}

export function loadAndUnlockInteractive(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const filename = getState().settings.current.privateKeyFile;
    if (!filename) {
      return;
    }

    await dispatch(load(filename));

    while (getState().privateKey.error === KeyError.ENCRYPTED || getState().privateKey.error === KeyError.PASSPHRASE) {
      let passphrase;
      try {
        const credentials = await dispatch(requestCredentials(path.resolve(filename), 'Private key passphrase required',
          `Please enter the passphrase for private key file ${filename} below.`));
        passphrase = credentials.password;
      } catch {
        dispatch({type: Actions.ERROR, payload: KeyError.CANCELLED});
        break;
      }

      await dispatch(load(filename, passphrase));

      if (getState().privateKey.error) {
        await dispatch(rejectCredentials(path.resolve(filename), 'Invalid passphrase'));
      } else {
        await dispatch(acceptCredentials(path.resolve(filename)));
      }
    }
  };
}

export function load(filename: string, passphrase?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    let keyData;
    try {
      keyData = await fs.readFile(filename);
    } catch (e) {
      console.error(e);
      toastr.error('Failed to read private key', e.message);
      dispatch({ type: Actions.ERROR, payload: KeyError.FILE });
      return;
    }

    try {
      const privateKey = parsePrivateKey(keyData, passphrase);
      console.log('key size => %d bits', privateKey.toPublic().size);

      dispatch({
        type: Actions.LOAD,
        payload: {
          key: privateKey,
          encrypted: !!passphrase
        }
      });
    } catch (e) {
      if (e instanceof sshpk.KeyEncryptedError) {
        dispatch({type: Actions.ERROR, payload: KeyError.ENCRYPTED});
      } else if (e instanceof sshpk.KeyParseError && (e as any).innerErr && (e as any).innerErr.message.startsWith('Incorrect passphrase')) {
        toastr.error('Decryption failed', 'Invalid passphrase');
        dispatch({type: Actions.ERROR, payload: KeyError.PASSPHRASE});
      } else {
        console.error(e);
        toastr.error('Private key unreadable', e.message);
        dispatch({type: Actions.ERROR, payload: KeyError.FILE});
      }
    }
  };
}

export function lock(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const filename = getState().settings.current.privateKeyFile;
    if (!filename || !getState().privateKey.key || !getState().privateKey.encrypted) {
      return;
    }

    await dispatch(clearStoredLogin(path.resolve(filename)));

    dispatch({
      type: Actions.LOCK
    });
  };
}

// when the private key setting changes, reload the private key
afterAction([Settings.Actions.LOAD, Settings.Actions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();
  if (settings.current.privateKeyFile && settings.current.privateKeyFile !== settings.previous.privateKeyFile) {
    dispatch(loadAndUnlockInteractive());
  }
});

// on any changes to the private key, dispatch a LOGIN action to notify other components
afterAction([Keys.Actions.LOAD, Keys.Actions.SAVED, Actions.LOAD, Actions.LOCK], (dispatch, getState: GetState) => {
  const { keys, privateKey } = getState();
  const currentUser = privateKey.key ? findUser(keys.byUser, privateKey.key) : undefined;
  if (currentUser !== privateKey.username) {
    dispatch({
      type: Actions.LOGIN,
      payload: currentUser
    });
  }
});

// after the repository is loaded, forward current user to new authorization provider
afterAction([Repository.Actions.FINISH_LOAD, Actions.LOGIN], (dispatch, getState: GetState) => {
  const { privateKey } = getState();
  const authProvider = Repository.getAuthProvider();
  if (authProvider) {
    authProvider.setCurrentUser(privateKey.key);
  }
});

type Action =
  TypedAction<Actions.LOAD, { key: sshpk.PrivateKey, encrypted: boolean }>
  | TypedAction<Actions.ERROR, KeyError>
  | OptionalAction<Actions.LOCK>
  | OptionalAction<Actions.LOGIN, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.LOAD:
      return { ...action.payload };
    case Actions.ERROR:
      return { error: action.payload, encrypted: action.payload !== KeyError.FILE };
    case Actions.LOCK:
      return { encrypted: state.encrypted };
    case Actions.LOGIN:
      return { ...state, username: action.payload };
    default:
      return state;
  }
}
