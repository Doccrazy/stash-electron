import { afterAction } from '../store/eventMiddleware';
import { GitCommitInfo } from '../utils/git';
import * as Git from './git';
import * as Repository from './repository';
import * as Settings from './settings';
import { Dispatch, GetState, TypedThunk } from './types';

const SETTINGS_KEY = 'repositories';

function addOrUpdate(path: string, name: string, rootCommit?: GitCommitInfo): TypedThunk<any, void> {
  return (dispatch, getState) => {
    const { repositories } = getState().settings.current;
    const clone = repositories.map((repo) => ({ ...repo }));
    const current = clone.find((repo) => repo.path === path);
    const id = getId(path, rootCommit);
    let updated;
    if (!current) {
      clone.push({ path, name, id });
      updated = true;
    } else if (id && current.id !== id) {
      current.id = id;
      updated = true;
    } else if (current.name !== name) {
      current.name = name;
      updated = true;
    }

    if (updated) {
      dispatch(Settings.changeAndSave(SETTINGS_KEY, clone));
    }
  };
}

export function removeFromList(path: string): TypedThunk<any, void> {
  return (dispatch, getState) => {
    const { repositories } = getState().settings.current;
    const clone = repositories.filter((repo) => repo.path !== path);

    if (clone.length !== repositories.length) {
      dispatch(Settings.changeAndSave(SETTINGS_KEY, clone));
    }
  };
}

function getId(path: string, rootCommit?: GitCommitInfo) {
  return rootCommit && rootCommit.hash;
}

afterAction([Repository.Actions.LOAD, Git.Actions.UPDATE_STATUS], (dispatch: Dispatch, getState: GetState) => {
  const { path, name } = getState().repository;
  if (path && name) {
    const rootCommit = getState().git.status.rootCommit;
    dispatch(addOrUpdate(path, name, rootCommit));
  }
});
