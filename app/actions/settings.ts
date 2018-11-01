import * as os from 'os';
import * as electronSettings from 'electron-settings';
import { KeyFormat, SettingsKeys, SettingsMap, State } from './types/settings';
import {TypedAction, GetState, TypedThunk, OptionalAction} from './types/index';
import {afterAction} from '../store/eventMiddleware';
import * as path from 'path';

export enum Actions {
  LOAD = 'settings/LOAD',
  CHANGE = 'settings/CHANGE',
  SAVE = 'settings/SAVE'
}

export function load(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.LOAD,
      payload: electronSettings.getAll() as SettingsMap
    });
  };
}

export function changeSetting<K extends SettingsKeys>(key: K, value: SettingsMap[K]): ChangeSettingAction<K> {
  return {
    type: Actions.CHANGE,
    payload: {
      key,
      value
    }
  };
}

export function changeAndSave<K extends SettingsKeys>(key: K, value: SettingsMap[K]): Thunk<void> {
  return (dispatch, getState) => {
    dispatch(changeSetting(key, value));

    dispatch({
      type: Actions.SAVE
    });

    electronSettings.set(key, getState().settings.current[key] as any);
  };
}

export function save(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.SAVE
    });

    electronSettings.setAll(getState().settings.current as any);
  };
}

afterAction([Actions.LOAD, Actions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();

  document.documentElement!.style.fontSize = `${settings.current.rootFontSize}px`;
});

function applyDefaults(settings: Partial<SettingsMap>): SettingsMap {
  const inactivityTimeout = Number.parseInt(settings.inactivityTimeout as any, 10);
  return {
    ...settings,
    rootFontSize: Math.min(Math.max(Number.parseInt(settings.rootFontSize as any, 10) || 15, 10), 20),
    privateKeyFile: settings.privateKeyFile || (os.platform() === 'linux' ? path.join(os.homedir(), '.ssh/id_rsa') : ''),
    inactivityTimeout: Number.isNaN(inactivityTimeout) ? 15 : inactivityTimeout,
    keyDisplayFormat: Object.values(KeyFormat).includes(settings.keyDisplayFormat) ? settings.keyDisplayFormat! : KeyFormat.SHA256
  };
}

type ChangeSettingAction<K extends SettingsKeys> = TypedAction<Actions.CHANGE, { key: K, value: SettingsMap[K] }>;

type Action =
  TypedAction<Actions.LOAD, SettingsMap>
  | ChangeSettingAction<SettingsKeys>
  | OptionalAction<Actions.SAVE>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { current: applyDefaults({}), edited: {}, previous: applyDefaults({}) }, action: Action): State {
  switch (action.type) {
    case Actions.LOAD: {
      const cleaned = applyDefaults(action.payload);
      return { current: cleaned, edited: cleaned, previous: state.current };
    }
    case Actions.CHANGE:
      return { ...state, edited: { ...state.edited, [action.payload.key]: action.payload.value }};
    case Actions.SAVE: {
      const cleaned = applyDefaults(state.edited);
      return { ...state, current: cleaned, edited: cleaned, previous: state.current };
    }
    default:
      return state;
  }
}
