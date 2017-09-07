import { remote } from 'electron';
import electronSettings from 'electron-settings';

export const LOAD = 'settings/LOAD';
export const CHANGE = 'settings/CHANGE';
export const SAVE = 'settings/SAVE';

export function load() {
  return (dispatch, getState) => {
    dispatch({
      type: LOAD,
      payload: electronSettings.getAll()
    });
  };
}

export function changeSetting(key, value) {
  return {
    type: CHANGE,
    payload: {
      key,
      value
    }
  };
}

export function save() {
  return (dispatch, getState) => {
    dispatch({
      type: SAVE
    });

    electronSettings.setAll(getState().settings.current);
  };
}

export function browseForFolder(key, title) {
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

export default function reducer(state = { current: {}, edited: {}, previous: {} }, action) {
  switch (action.type) {
    case LOAD:
      return { current: action.payload, edited: action.payload, previous: {} };
    case CHANGE:
      return { ...state, edited: { ...state.edited, [action.payload.key]: action.payload.value }};
    case SAVE:
      return { ...state, current: state.edited, previous: state.current };
    default:
      return state;
  }
}
