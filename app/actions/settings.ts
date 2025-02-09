import * as os from 'os';
import * as remote from '@electron/remote';
import electronSettings from 'electron-settings';
import { KeyFormat, SettingsKeys, SettingsMap, State } from './types/settings';
import { TypedAction, GetState, TypedThunk, OptionalAction } from './types/index';
import { afterAction } from '../store/eventMiddleware';
import * as path from 'path';
import { bestSupportedLocale } from '../utils/i18n/message';

electronSettings.configure({ fileName: 'Settings', electron: { remote } as any });

export enum Actions {
  LOAD = 'settings/LOAD',
  CHANGE = 'settings/CHANGE',
  SAVE = 'settings/SAVE'
}

export function load(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.LOAD,
      payload: electronSettings.getSync() as unknown as SettingsMap
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

    electronSettings.setSync(key, getState().settings.current[key] as any);
  };
}

export function save(): Thunk<void> {
  return (dispatch, getState) => {
    dispatch({
      type: Actions.SAVE
    });

    electronSettings.setSync(getState().settings.current as any);
  };
}

export function browseForFolder(key: SettingsKeys, title: string, instantSave?: boolean): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const folder = (
      await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title,
        properties: ['openDirectory']
      })
    ).filePaths;

    if (folder && folder[0]) {
      if (instantSave) {
        dispatch(changeAndSave(key, folder[0]));
      } else {
        dispatch(changeSetting(key, folder[0]));
      }
    }
  };
}

export function browseForFile(
  key: SettingsKeys,
  title: string,
  filters?: { extensions: string[]; name: string }[],
  doSave?: boolean
): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const file = (
      await remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
        title,
        filters,
        properties: ['openFile', 'showHiddenFiles']
      })
    ).filePaths;

    if (file && file[0]) {
      if (doSave) {
        dispatch(changeAndSave(key, file[0]));
      } else {
        dispatch(changeSetting(key, file[0]));
      }
    }
  };
}

afterAction([Actions.LOAD, Actions.SAVE], (dispatch, getState: GetState) => {
  const { settings } = getState();

  document.documentElement.style.fontSize = `${settings.current.rootFontSize}px`;
});

function applyDefaults(settings: Partial<SettingsMap>): SettingsMap {
  const inactivityTimeout = Number.parseInt(settings.inactivityTimeout as any, 10);
  return {
    ...settings,
    rootFontSize: Math.min(Math.max(Number.parseInt(settings.rootFontSize as any, 10) || 15, 10), 20),
    privateKeyFile: settings.privateKeyFile || (os.platform() === 'linux' ? path.join(os.homedir(), '.ssh/id_rsa') : ''),
    inactivityTimeout: Number.isNaN(inactivityTimeout) ? 15 : inactivityTimeout,
    keyDisplayFormat:
      settings.keyDisplayFormat && Object.values(KeyFormat).includes(settings.keyDisplayFormat)
        ? settings.keyDisplayFormat
        : KeyFormat.SHA256,
    locale: settings.locale || bestSupportedLocale(remote.app.getLocale()),
    storedLogins: settings.storedLogins || [],
    repositories: settings.repositories || [],
    privateKeys: settings.privateKeys || [],
    privateBinSite: settings.privateBinSite || 'https://privatebin.net/'
  };
}

type ChangeSettingAction<K extends SettingsKeys> = TypedAction<Actions.CHANGE, { key: K; value: SettingsMap[K] }>;

type Action = TypedAction<Actions.LOAD, SettingsMap> | ChangeSettingAction<SettingsKeys> | OptionalAction<Actions.SAVE>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(
  state: State = { current: applyDefaults({}), edited: {}, previous: applyDefaults({}) },
  action: Action
): State {
  switch (action.type) {
    case Actions.LOAD: {
      const cleaned = applyDefaults(action.payload);
      return { current: cleaned, edited: cleaned, previous: state.current };
    }
    case Actions.CHANGE:
      return { ...state, edited: { ...state.edited, [action.payload.key]: action.payload.value } };
    case Actions.SAVE: {
      const cleaned = applyDefaults(state.edited);
      return { ...state, current: cleaned, edited: cleaned, previous: state.current };
    }
    default:
      return state;
  }
}
