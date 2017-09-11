import { remote } from 'electron';
import * as electronSettings from 'electron-settings';
import {SettingsKeys, SettingsMap, State} from './types/settings';
import {Action, GetState, Thunk} from './types/index';
import {afterAction} from '../store/eventMiddleware';

export const LOAD = 'settings/LOAD';
export const CHANGE = 'settings/CHANGE';
export const SAVE = 'settings/SAVE';

export function load(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD,
      payload: electronSettings.getAll()
    });
  };
}

export function changeSetting<K extends SettingsKeys>(key: K, value: SettingsMap[K]): Action<{ key: K, value: SettingsMap[K]}> {
  return {
    type: CHANGE,
    payload: {
      key,
      value
    }
  };
}

export function save(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: SAVE
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

afterAction([LOAD, SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();

  document.documentElement.style.fontSize = `${settings.current.rootFontSize}px`;
});

function applyDefaults(settings: SettingsMap): SettingsMap {
  return {
    ...settings,
    rootFontSize: settings.rootFontSize || 16
  };
}

export default function reducer(state: State = { current: {}, edited: {}, previous: {} }, action: Action<any>): State {
  switch (action.type) {
    case LOAD:
      return { current: applyDefaults(action.payload), edited: applyDefaults(action.payload), previous: {} };
    case CHANGE:
      return { ...state, edited: { ...state.edited, [action.payload.key]: action.payload.value }};
    case SAVE:
      return { ...state, current: applyDefaults(state.edited), previous: state.current };
    default:
      return state;
  }
}
