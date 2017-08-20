import electronSettings from 'electron-settings';
import { load as loadRepo } from './repository';

export const LOAD = 'settings/LOAD';

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
