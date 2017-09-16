import * as os from 'os';
import { remote } from 'electron';
import * as electronSettings from 'electron-settings';
import {SettingsKeys, SettingsMap, State} from './types/settings';
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

export function browseForFolder(key: SettingsKeys, title: string): Thunk<void> {
  return (dispatch, getState) => {
    const folder = remote.dialog.showOpenDialog({
      title,
      properties: ['openDirectory']
    });

    if (folder && folder[0]) {
      dispatch(changeSetting(key, folder[0]));
    }
  };
}

export function browseForFile(key: SettingsKeys, title: string, filters?: { extensions: string[], name: string }[]): Thunk<void> {
  return (dispatch, getState) => {
    const file = remote.dialog.showOpenDialog({
      title,
      filters,
      properties: ['openFile', 'showHiddenFiles']
    });

    if (file && file[0]) {
      dispatch(changeSetting(key, file[0]));
    }
  };
}

afterAction([Actions.LOAD, Actions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();

  document.documentElement.style.fontSize = `${settings.current.rootFontSize}px`;
});

function applyDefaults(settings: SettingsMap): SettingsMap {
  return {
    ...settings,
    rootFontSize: settings.rootFontSize || 16,
    ...(os.platform() === 'linux' ? { privateKeyFile: path.join(os.homedir(), '.ssh/id_rsa') } : {})
  };
}

type ChangeSettingAction<K extends SettingsKeys> = TypedAction<Actions.CHANGE, { key: K, value: SettingsMap[K] }>;

type Action =
  TypedAction<Actions.LOAD, SettingsMap>
  | ChangeSettingAction<SettingsKeys>
  | OptionalAction<Actions.SAVE>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { current: {}, edited: {}, previous: {} }, action: Action): State {
  switch (action.type) {
    case Actions.LOAD:
      return { current: applyDefaults(action.payload), edited: applyDefaults(action.payload), previous: {} };
    case Actions.CHANGE:
      return { ...state, edited: { ...state.edited, [action.payload.key]: action.payload.value }};
    case Actions.SAVE:
      return { ...state, current: applyDefaults(state.edited), previous: state.current };
    default:
      return state;
  }
}
