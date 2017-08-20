import fs from 'mz/fs';
import path from 'path';

export const LOAD = 'repository/LOAD';
export const RESET_DIRS = 'repository/RESET_DIRS';
export const READ_DIR = 'repository/READ_DIR';
export const EXPAND = 'repository/EXPAND';
export const CLOSE = 'repository/CLOSE';
export const SELECT = 'repository/SELECT';

export function load(repoPath) {
  return async dispatch => {
    dispatch({
      type: RESET_DIRS
    });
    dispatch({
      type: LOAD,
      payload: repoPath
    });
    await dispatch(select('/'));
  };
}

export function readDir(subPath, recurse = true) {
  return async (dispatch, getState) => {
    const { repository } = getState();
    const dirPath = path.join(repository.path, subPath);

    console.time('readdirSync');
    //const files = fs.readdirSync(dirPath);
    const files = await fs.readdir(dirPath);
    console.timeEnd('readdirSync');
    console.time(`stat x${files.length}`);
    const fileStats = await Promise.all(files.map(fn => fs.stat(path.join(dirPath, fn))));
    console.timeEnd(`stat x${files.length}`);

    const result = {
      path: subPath,
      entries: [],
      children: []
    };
    files.forEach((file, idx) => {
      const stat = fileStats[idx];
      //const stat = fs.statSync(path.join(dirPath, file));
      if (stat.isFile()) {
        result.entries.push(file);
      } else if (stat.isDirectory()) {
        result.children.push(file);
      }
    });
    dispatch({
      type: READ_DIR,
      payload: result
    });
    if (recurse) {
      result.children.forEach(childId => dispatch(readDir(`${subPath}${childId}/`, false)));
    }
  };
}

function maybeExpand(dispatch, getState, subPath) {
  const { repository } = getState();
  if (repository.nodes[subPath].children && repository.nodes[subPath].children.length && !repository.open.has(subPath)) {
    dispatch({
      type: EXPAND,
      payload: subPath
    });
  }
}

export function expand(subPath) {
  return async (dispatch, getState) => {
    await dispatch(readDir(subPath));

    maybeExpand(dispatch, getState, subPath);
  };
}

export function close(subPath) {
  return {
    type: CLOSE,
    payload: subPath
  };
}

export function toggle(subPath) {
  return (dispatch, getState) => {
    const { repository } = getState();
    if (repository.open.has(subPath)) {
      dispatch(close(subPath));
    } else {
      dispatch(expand(subPath));
    }
  };
}

export function select(subPath) {
  return async (dispatch, getState) => {
    await dispatch(readDir(subPath));
    dispatch({
      type: SELECT,
      payload: subPath
    });
    maybeExpand(dispatch, getState, subPath);
  };
}
