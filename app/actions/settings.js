import electronSettings from 'electron-settings';
import { load as loadRepo } from './repository';

const LOAD = 'settings/LOAD';

export function load() {
  return (dispatch, getState) => {
    // electronSettings.set('repositoryPath', '/foo/bar');
    dispatch({
      type: LOAD,
      payload: electronSettings.getAll()
    });
    const { settings } = getState();
    if (settings.repositoryPath) {
      dispatch(loadRepo(settings.repositoryPath));
    }
  };
}

export default function reducer(state = { }, action) {
  switch (action.type) {
    case LOAD:
      return action.payload;
    default:
      return state;
  }
}
