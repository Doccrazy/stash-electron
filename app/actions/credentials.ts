import { EventEmitter } from 'events';
import * as keytar from 'keytar';
import {OptionalAction, TypedAction, TypedThunk} from './types/index';
import {Credentials, State, FormState} from './types/credentials';
import * as Settings from './settings';

export enum Actions {
  OPEN = 'credentials/OPEN',
  CLOSE = 'credentials/CLOSE',
  CHANGE = 'credentials/CHANGE',
  ERROR = 'credentials/ERROR'
}

const KEYTAR_SERVICE = 'de.doccrazy.Stash';

const credentialsEvents = new EventEmitter();

export function requestCredentials(title: string, text: string, username?: string, askUsername?: boolean): Thunk<Promise<Credentials>> {
  return async (dispatch, getState) => {
    if (username && (getState().settings.current.storedLogins || []).includes(username)) {
      const password = await keytar.getPassword(KEYTAR_SERVICE, username);
      if (password) {
        dispatch(change({ username, password }));
        return { username, password };
      }
    }

    if (!getState().credentials.open) {
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

    return new Promise<Credentials>((resolve, reject) => {
      credentialsEvents.once('close', (success: boolean) => {
        const formState = getState().credentials.state;
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
    const formState = getState().credentials.state;
    if (formState.savePassword && formState.username && formState.password) {
      await keytar.setPassword(KEYTAR_SERVICE, formState.username, formState.password);

      dispatch(Settings.changeAndSave('storedLogins', [...(getState().settings.current.storedLogins || []), formState.username]) as any);
    }
    dispatch({
      type: Actions.CLOSE
    });
  };
}

export function rejectCredentials(error: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const formState = getState().credentials.state;
    if (formState.username) {
      await keytar.deletePassword(KEYTAR_SERVICE, formState.username);

      dispatch(Settings.changeAndSave('storedLogins', (getState().settings.current.storedLogins || []).filter(un => un !== formState.username)) as any);
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
    credentialsEvents.emit('close');
  };
}

export function confirm(): Thunk<void> {
  return (dispatch, getState) => {
    credentialsEvents.emit('close', true);
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
      return { ...state, error: action.payload, state: { ...state.state, password: undefined } };
    default:
      return state;
  }
}