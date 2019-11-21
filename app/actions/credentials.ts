import { toastr } from 'react-redux-toastr';
import { GetState, OptionalAction, TypedAction, TypedThunk } from './types/index';
import {Credentials, State, FormState} from './types/credentials';
import * as Settings from './settings';
import { onceAfterAction } from '../store/eventMiddleware';
import { t } from '../utils/i18n/redux';

export enum Actions {
  OPEN = 'credentials/OPEN',
  CLOSE = 'credentials/CLOSE',
  CHANGE = 'credentials/CHANGE',
  SUBMIT = 'credentials/SUBMIT',
  ERROR = 'credentials/ERROR'
}

const KEYTAR_SERVICE = 'de.doccrazy.Stash';
const SETTINGS_KEY = 'storedLogins';

function keytarEncode(credentials: Credentials) {
  return JSON.stringify(credentials);
}

function keytarDecode(val: string | null): Credentials | undefined {
  return val ? JSON.parse(val) : null;
}

export function hasStoredLogin(getState: GetState, context: string) {
  return (getState().settings.current[SETTINGS_KEY] || []).includes(context);
}

export function clearStoredLogin(context: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    if (!hasStoredLogin(getState, context)) {
      return;
    }

    try {
      dispatch(Settings.changeAndSave(SETTINGS_KEY, getState().settings.current.storedLogins.filter(ctx => ctx !== context)) as any);

      const keytar = await import('keytar');
      await keytar.deletePassword(KEYTAR_SERVICE, context);
    } catch (e) {
      // failed to delete password
      console.error(e);
    }
  };
}

export function requestCredentials(context: string, title: string, text: string, username?: string,
                                   askUsername?: boolean, defaultSavePassword?: boolean): Thunk<Promise<Credentials>> {
  return async (dispatch, getState) => {
    if (hasStoredLogin(getState, context)) {
      try {
        const keytar = await import('keytar');
        const userPass = keytarDecode(await keytar.getPassword(KEYTAR_SERVICE, context));
        if (userPass && userPass.password) {
          return userPass;
        }
      } catch (e) {
        // failed to get password from keytar
        console.error(e);
      }
    }

    if (getState().credentials.open) {
      if (context !== getState().credentials.context) {
        return new Promise<Credentials>((resolve, reject) => {
          onceAfterAction(Actions.CLOSE, () => {
            // TODO wait for other popup to fully close (reactstrap bug?)
            setTimeout(() => {
              resolve(dispatch(requestCredentials(context, title, text, username, askUsername, defaultSavePassword)));
            }, 500);
          });
        });
      }
    } else {
      dispatch({
        type: Actions.OPEN,
        payload: {
          context,
          title,
          text,
          username,
          askUsername,
          defaultSavePassword
        }
      });
    }

    return new Promise<Credentials>((resolve, reject) => {
      onceAfterAction([Actions.CLOSE, Actions.SUBMIT], () => {
        const formState = getState().credentials.state;
        if (formState && (!askUsername || formState.username) && formState.password) {
          const result: Credentials = { username: formState.username, password: formState.password };
          resolve(result);
        } else {
          reject(new Error('cancelled by user'));
        }
      });
    });
  };
}

export function acceptCredentials(context: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { credentials } = getState();

    if (context !== credentials.context) {
      // form never opened (likely because valid credentials were stored)
      return;
    }

    const formState = credentials.state;
    if (credentials.context && formState.savePassword && formState.password) {
      try {
        const keytar = await import('keytar');
        await keytar.setPassword(KEYTAR_SERVICE, credentials.context, keytarEncode({
          username: formState.username,
          password: formState.password
        }));

        dispatch(Settings.changeAndSave(SETTINGS_KEY, [...getState().settings.current.storedLogins, credentials.context]) as any);
      } catch (e) {
        // failed to save password
        toastr.error(t('component.loginPopup.error.storeCredentials.title'),
          t('component.loginPopup.error.storeCredentials.message'));
        console.error(e);
      }
    }
    dispatch({
      type: Actions.CLOSE
    });
  };
}

export function rejectCredentials(context: string, error: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    await dispatch(clearStoredLogin(context));

    // only show error if rejection came from currently open dialog
    if (context === getState().credentials.context) {
      dispatch({
        type: Actions.ERROR,
        payload: error
      });
    }
  };
}

export function close(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.CLOSE
    });
  };
}

export function confirm(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.SUBMIT
    });
  };
}

export function change(value: FormState): Action {
  return {
    type: Actions.CHANGE,
    payload: value
  };
}

type Action =
  TypedAction<Actions.OPEN, { context: string, title: string, text: string, username?: string, askUsername?: boolean, defaultSavePassword?: boolean }>
  | OptionalAction<Actions.CLOSE>
  | TypedAction<Actions.CHANGE, FormState>
  | OptionalAction<Actions.SUBMIT>
  | TypedAction<Actions.ERROR, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { state: {} }, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
      return {
        open: true,
        context: action.payload.context,
        title: action.payload.title,
        text: action.payload.text,
        askUsername: action.payload.askUsername,
        state: { username: action.payload.username, savePassword: action.payload.defaultSavePassword }
      };
    case Actions.CLOSE:
      return { open: false, state: {} };
    case Actions.CHANGE:
      return { ...state, state: action.payload };
    case Actions.SUBMIT:
      return { ...state, working: true };
    case Actions.ERROR:
      return { ...state, working: false, error: action.payload, state: { ...state.state, password: undefined } };
    default:
      return state;
  }
}
