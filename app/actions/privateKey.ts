import * as fs from 'fs-extra';
import * as path from 'path';
import * as sshpk from 'sshpk';
import {toastr} from 'react-redux-toastr';
import {GetState, OptionalAction, TypedAction, TypedThunk} from './types/index';
import {KeyError, State} from './types/privateKey';
import {afterAction} from '../store/eventMiddleware';
import * as Settings from './settings';
import {requestCredentials, acceptCredentials, rejectCredentials} from './credentials';
import {parsePrivateKey} from '../utils/rsa';
import * as Keys from './keys';
import {findUser} from '../repository/KeyProvider';

export enum Actions {
  LOAD = 'privateKey/LOAD',
  ERROR = 'privateKey/ERROR',
  LOGIN = 'privateKey/LOGIN'
}

export function loadWithFeedback(filename: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    await dispatch(load(filename));

    while (getState().privateKey.error === KeyError.ENCRYPTED || getState().privateKey.error === KeyError.PASSPHRASE) {
      let passphrase;
      try {
        const credentials = await dispatch(requestCredentials('Private key passphrase required',
          `Please enter the passphrase for private key file ${filename} below.`, path.resolve(filename), false));
        passphrase = credentials.password;
      } catch {
        dispatch({type: Actions.ERROR, payload: KeyError.CANCELLED});
        break;
      }

      await dispatch(load(filename, passphrase));

      if (getState().privateKey.error) {
        await dispatch(rejectCredentials('Invalid passphrase'));
      } else {
        await dispatch(acceptCredentials());
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
        payload: privateKey
      });
    } catch (e) {
      console.error(e);
      if (e instanceof sshpk.KeyEncryptedError) {
        dispatch({type: Actions.ERROR, payload: KeyError.ENCRYPTED});
      } else if (e instanceof sshpk.KeyParseError && (e as any).innerErr && (e as any).innerErr.message.startsWith('Incorrect passphrase')) {
        toastr.error('Decryption failed', 'Invalid passphrase');
        dispatch({type: Actions.ERROR, payload: KeyError.PASSPHRASE});
      } else {
        toastr.error('Private key unreadable', e.message);
        dispatch({type: Actions.ERROR, payload: KeyError.FILE});
      }
    }
  };
}

export function cancelLoad() {
  return {
    type: Actions.ERROR,
    payload: KeyError.CANCELLED
  };
}

afterAction([Settings.Actions.LOAD, Settings.Actions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();
  if (settings.current.privateKeyFile && settings.current.privateKeyFile !== settings.previous.privateKeyFile) {
    dispatch(loadWithFeedback(settings.current.privateKeyFile));
  }
});

afterAction([Keys.Actions.LOAD, Keys.Actions.SAVED, Actions.LOAD], (dispatch, getState: GetState) => {
  const { keys, privateKey } = getState();
  const currentUser = privateKey.key ? findUser(keys.byUser, privateKey.key) : undefined;
  if (currentUser !== privateKey.username) {
    dispatch({
      type: Actions.LOGIN,
      payload: currentUser
    });
  }
});

type Action =
  TypedAction<Actions.LOAD, sshpk.PrivateKey>
  | TypedAction<Actions.ERROR, KeyError>
  | OptionalAction<Actions.LOGIN, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {}, action: Action): State {
  switch (action.type) {
    case Actions.LOAD:
      return { key: action.payload };
    case Actions.ERROR:
      return { error: action.payload };
    case Actions.LOGIN:
      return { ...state, username: action.payload };
    default:
      return state;
  }
}
