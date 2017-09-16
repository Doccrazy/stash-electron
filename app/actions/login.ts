import { EventEmitter } from 'events';
import * as keytar from 'keytar';
import {OptionalAction, TypedAction, TypedThunk} from './types/index';
import {Credentials, State, FormState} from './types/login';
import * as Settings from './settings';

export enum Actions {
  OPEN = 'login/OPEN',
  CLOSE = 'login/CLOSE',
  CHANGE = 'login/CHANGE',
  ERROR = 'login/ERROR'
}

const KEYTAR_SERVICE = 'de.doccrazy.Stash';

const loginEvents = new EventEmitter();

export function requestCredentials(title: string, text: string, username?: string, askUsername?: boolean): Thunk<Promise<Credentials>> {
  return async (dispatch, getState) => {
    if (username && (getState().settings.current.storedLogins || []).includes(username)) {
      const password = await keytar.getPassword(KEYTAR_SERVICE, username);
      if (password) {
        dispatch(change({ username, password }));
        return { username, password };
      }
    }

    if (!getState().login.open) {
      dispatch({
        type: Actions.OPEN,
        payload: {
          title,
          text,
          username,
          askUsername
        }
      });
    }

    return await new Promise<Credentials>((resolve, reject) => {
      loginEvents.once('close', (success: boolean) => {
        const formState = getState().login.state;
        if (formState && formState.username && formState.password) {
          const result: Credentials = { username: formState.username, password: formState.password };
          resolve(result);
        } else {
          reject('cancelled by user');
        }
      });
    });
  };
}

export function acceptCredentials(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const formState = getState().login.state;
    if (formState.savePassword && formState.username && formState.password) {
      await keytar.setPassword(KEYTAR_SERVICE, formState.username, formState.password);

      dispatch(Settings.changeSetting('storedLogins', [...(getState().settings.current.storedLogins || []), formState.username]) as any);
      dispatch(Settings.save());
    }
    dispatch({
      type: Actions.CLOSE
    });
  };
}

export function rejectCredentials(error: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const formState = getState().login.state;
    if (formState.username) {
      await keytar.deletePassword(KEYTAR_SERVICE, formState.username);

      dispatch(Settings.changeSetting('storedLogins', (getState().settings.current.storedLogins || []).filter(un => un !== formState.username)) as any);
      dispatch(Settings.save());
    }
    dispatch({
      type: Actions.ERROR,
      payload: error
    });
  };
}

export function close(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.CLOSE
    });
    loginEvents.emit('close');
  };
}

export function confirm(): Thunk<void> {
  return (dispatch, getState) => {
    loginEvents.emit('close', true);
  };
}

export function change(value: FormState): Action {
  return {
    type: Actions.CHANGE,
    payload: value
  };
}

type Action =
  TypedAction<Actions.OPEN, { title: string, text: string, username?: string, askUsername?: boolean }>
  | OptionalAction<Actions.CLOSE>
  | TypedAction<Actions.CHANGE, FormState>
  | TypedAction<Actions.ERROR, string>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { state: {} }, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
      return {
        open: true,
        title: action.payload.title,
        text: action.payload.text,
        askUsername: action.payload.askUsername,
        state: { username: action.payload.username }
      };
    case Actions.CLOSE:
      return { open: false, state: {} };
    case Actions.CHANGE:
      return { ...state, state: action.payload };
    case Actions.ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
