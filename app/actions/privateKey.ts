import * as fs from 'fs-extra';
import * as path from 'path';
import * as sshpk from 'sshpk';
import * as os from 'os';
import {toastr} from 'react-redux-toastr';
import { remote } from 'electron';
import {GetState, OptionalAction, TypedAction, TypedThunk} from './types/index';
import {KeyError, State} from './types/privateKey';
import {afterAction} from '../store/eventMiddleware';
import * as Settings from './settings';
import { requestCredentials, acceptCredentials, rejectCredentials, clearStoredLogin } from './credentials';
import { generateRSAKeyPKCS8, parsePrivateKey, toPEM } from '../utils/rsa';
import * as Keys from './keys';
import * as Repository from './repository';
import {findUser} from '../repository/KeyProvider';

export enum Actions {
  LOAD = 'privateKey/LOAD',
  ERROR = 'privateKey/ERROR',
  LOCK = 'privateKey/LOCK',
  LOGIN = 'privateKey/LOGIN',
  OPEN_GENERATE = 'privateKey/OPEN_GENERATE',
  CLOSE_GENERATE = 'privateKey/CLOSE_GENERATE',
  CHANGE_GEN_PASS = 'privateKey/CHANGE_GEN_PASS',
  GENERATE_WORKING = 'privateKey/GENERATE_WORKING'
}

export function loadAndUnlockInteractive(presetPassphrase?: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const filename = getState().settings.current.privateKeyFile;
    if (!filename) {
      return;
    }

    await dispatch(load(filename, presetPassphrase));

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

export function openGenerate(): Action {
  return {
    type: Actions.OPEN_GENERATE
  };
}

export function closeGenerate(): Action {
  return {
    type: Actions.CLOSE_GENERATE
  };
}

export function changeGeneratePassphrase(passphrase: string, repeat?: boolean): Action {
  return {
    type: Actions.CHANGE_GEN_PASS,
    payload: {
      passphrase,
      repeat
    }
  };
}

export function generateKeyAndPromptSave(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch({ type: Actions.GENERATE_WORKING, payload: true });

    try {
      const pkcs8Key = await generateRSAKeyPKCS8();
      const finalKey = toPEM(pkcs8Key, getState().privateKey.generate.passphrase);

      const file = remote.dialog.showSaveDialog({
        title: 'Save private key',
        filters: [{name: 'PEM-encoded private key', extensions: ['pem']}],
        defaultPath: os.homedir()
      });
      if (file) {
        await fs.writeFile(file, finalKey);
        dispatch(Settings.changeAndSave('privateKeyFile', file));
        dispatch(closeGenerate());
      }
    } catch (e) {
      toastr.error('Failed to generate key', e.message);
    }

    dispatch({ type: Actions.GENERATE_WORKING, payload: false });
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
  | OptionalAction<Actions.LOGIN, string>
  | OptionalAction<Actions.OPEN_GENERATE>
  | OptionalAction<Actions.CLOSE_GENERATE>
  | TypedAction<Actions.CHANGE_GEN_PASS, { passphrase: string, repeat?: boolean }>
  | OptionalAction<Actions.GENERATE_WORKING, boolean>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { generate: {}}, action: Action): State {
  switch (action.type) {
    case Actions.LOAD:
      return { ...action.payload, generate: {} };
    case Actions.ERROR:
      return { error: action.payload, encrypted: action.payload !== KeyError.FILE, generate: state.generate };
    case Actions.LOCK:
      return { encrypted: state.encrypted, generate: {} };
    case Actions.LOGIN:
      return { ...state, username: action.payload };
    case Actions.OPEN_GENERATE:
      return { ...state, generate: { open: true } };
    case Actions.CLOSE_GENERATE:
      return { ...state, generate: { open: false } };
    case Actions.CHANGE_GEN_PASS:
      const generate = { ...state.generate };
      if (action.payload.repeat) {
        generate.repeatPassphrase = action.payload.passphrase;
      } else {
        generate.passphrase = action.payload.passphrase;
      }
      return { ...state, generate };
    case Actions.GENERATE_WORKING:
      return { ...state, generate: { ...state.generate, working: action.payload } };
    default:
      return state;
  }
}
