import * as assert from 'assert';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Git from 'nodegit';
import { toastr } from 'react-redux-toastr';
import { remote } from 'electron';
import { afterAction } from '../store/eventMiddleware';
import {
  accessingRepository,
  addToGitIgnore,
  commitAllChanges,
  compareRefs,
  fetchWithRetry, GitCredentials,
  hasUncommittedChanges, isSignatureConfigured,
  pushWithRetry, remoteNameFromRef,
  resolveAllUsingTheirs
} from '../utils/git';
import { RES_LOCAL_FILENAMES } from '../utils/repository';
import * as Credentials from './credentials';
import * as Repository from './repository';
import { FetchResult, GitStatus, State } from './types/git';
import { GetState, OptionalAction, TypedAction, TypedDispatch, TypedThunk } from './types/index';
import { changeAndSave } from './settings';

export enum Actions {
  PROGRESS = 'git/PROGRESS',
  UPDATE_STATUS = 'git/UPDATE_STATUS',
  OPEN_POPUP = 'git/OPEN_POPUP',
  MARK_FOR_RESET = 'git/MARK_FOR_RESET',
  CLOSE_POPUP = 'git/CLOSE_POPUP',
  OPEN_CLONE_POPUP = 'git/OPEN_CLONE_POPUP',
  CHANGE_CLONE_URL = 'git/CHANGE_CLONE_URL',
  CHANGE_CLONE_TARGET = 'git/CHANGE_CLONE_TARGET',
  CLOSE_CLONE_POPUP = 'git/CLOSE_CLONE_POPUP'
}

export function updateStatus(doFetch: boolean): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const repoPath = Repository.getRepo().rootPath;

    const status = await dispatch(determineGitStatus(repoPath, doFetch));
    dispatch({
      type: Actions.UPDATE_STATUS,
      payload: {
        status,
        updated: new Date()
      }
    });
    if (status.incomingCommits) {
      toastr.info('', `${status.incomingCommits} commit(s) received from '${status.upstreamName}'.`);

      await dispatch(Repository.reload());
    }
    if (status.conflict && !getState().git.popupOpen) {
      dispatch(openPopup());
    }
  };
}

function determineGitStatus(repoPath: string, doFetch: boolean): Thunk<Promise<GitStatus>> {
  return async (dispatch, getState) => {
    const oldStatus = getState().git.status;
    const status: GitStatus = { initialized: false };
    try {
      await accessingRepository(repoPath, async gitRepo => {
        status.initialized = true;

        if (gitRepo.headUnborn()) {
          // new repo, no point in continuing
          return;
        }

        let currentRef = await gitRepo.head();
        status.branchName = currentRef.shorthand();

        if (gitRepo.isRebasing() || gitRepo.isMerging()) {
          status.conflict = true;
          return;
        }

        if (gitRepo.headDetached()) {
          status.error = 'detached head';
          return;
        }

        if (!isSignatureConfigured(gitRepo)) {
          status.error = 'git user name and email are not configured';
          return;
        }

        let upstream: Git.Reference;
        try {
          upstream = await Git.Branch.upstream(currentRef);
        } catch (e) {
          status.error = 'current branch is not tracking any remote';
          return;
        }
        status.upstreamName = upstream.shorthand();
        const remoteName = remoteNameFromRef(upstream);

        // if not fetching or fetch fails, remember bg mode from last fetch
        status.allowBackgroundFetch = oldStatus.allowBackgroundFetch;

        if (doFetch && remoteName) {
          const fetchResult = await dispatch(gitFetchRemote(gitRepo, remoteName));
          // we can only do background updates if the user saved the credentials
          status.allowBackgroundFetch = fetchResult.allowNonInteractive;
          upstream = await Git.Branch.upstream(currentRef);
        }

        let trackingState = await compareRefs(currentRef, upstream);
        if (trackingState.behind) {
          status.incomingCommits = trackingState.behind;
          // if origin is ahead, we need to fast-forward or rebase (rebaseBranches will do the appropriate)
          try {
            await gitRepo.rebaseBranches(currentRef.name(), upstream.name(), '', null as any, null as any);
            currentRef = await gitRepo.head();
          } catch (e) {
            if (e instanceof Git.Index) {
              // rebase failed due to conflicts
              status.conflict = true;
              return;
            } else {
              throw e;
            }
          }
          trackingState = await compareRefs(currentRef, upstream);
          assert.equal(trackingState.behind, 0, 'no commits on origin after successful rebase');
        }
        status.commitsAheadOrigin = trackingState.ahead;

        let commit = await gitRepo.getHeadCommit();
        status.commits = [];
        for (let i = 0; i < status.commitsAheadOrigin + (status.incomingCommits || 0) + 1; i++) {
          status.commits.push({
            hash: commit.id().tostrS(),
            message: commit.message(),
            authorName: (commit.author().name as any)(),  // error in typings and docs
            authorEmail: (commit.author().email as any)(),  // error in typings and docs
            date: commit.date(),
            pushed: i >= status.commitsAheadOrigin
          });
          if (commit.parentcount() === 0) {
            break;
          }
          commit = await commit.parent(0);
        }
      });
    } catch (e) {
      console.error(e);
      status.error = e.message;
    }
    return status;
  };
}

async function withCredentials(dispatch: TypedDispatch<Action>,
                               cb: (credentialsCb: (url: string, usernameFromUrl: string) => Promise<GitCredentials>) => any): Promise<string | null> {
  let credentialsContext: string | null = null;
  try {
    await cb(async (url: string, usernameFromUrl: string) => {
      if (credentialsContext) {
        await dispatch(Credentials.rejectCredentials(credentialsContext, 'Authentication failed'));
      }
      credentialsContext = null;
      const result = await dispatch(Credentials.requestCredentials(url, 'Authenticate to git repository',
        `The git repository at ${url} has requested authentication.
             Please enter your credentials below.`, usernameFromUrl, true, true));
      credentialsContext = url;
      return result;
    });
    if (credentialsContext) {
      await dispatch(Credentials.acceptCredentials(credentialsContext));
    }
    return credentialsContext;
  } catch (e) {
    if (credentialsContext) {
      await dispatch(Credentials.rejectCredentials(credentialsContext, 'Operation failed'));
      await dispatch(Credentials.close());
    }
    throw e;
  }
}

function gitFetchRemote(gitRepo: Git.Repository, remoteName: string): Thunk<Promise<FetchResult>> {
  return async (dispatch, getState) => {
    dispatch({ type: Actions.PROGRESS, payload: { message: `Fetching from ${remoteName}` } });
    try {
      const credentialsContext = await withCredentials(dispatch, async credentialsCb => {
        await fetchWithRetry(gitRepo, remoteName, credentialsCb);
      });
      return {
        success: true,
        // for a private repository, background pulls are only possible if the user saved the login
        allowNonInteractive: !credentialsContext || Credentials.hasStoredLogin(getState, credentialsContext)
      };
    } finally {
      dispatch({ type: Actions.PROGRESS, payload: { done: true } });
    }
  };
}

function gitPushRemote(gitRepo: Git.Repository, remoteName: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    dispatch({ type: Actions.PROGRESS, payload: { message: `Pushing to ${remoteName}` } });
    try {
      await withCredentials(dispatch, async credentialsCb => {
        await pushWithRetry(gitRepo, remoteName, credentialsCb);
      });
    } finally {
      dispatch({ type: Actions.PROGRESS, payload: { done: true } });
    }
  };
}

export function resetStatus(): Action {
  return {
    type: Actions.UPDATE_STATUS,
    payload: {
      status: {
        initialized: false
      },
      updated: new Date()
    }
  };
}

export function resolveConflict(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const repoPath = Repository.getRepo().rootPath;

    try {
      await accessingRepository(repoPath, async gitRepo => {
        if (gitRepo.isMerging()) {
          toastr.error('Manual resolution required', 'Merge not implemented');
          return;
        }

        if (!gitRepo.isRebasing()) {
          return;
        }

        let index = await gitRepo.refreshIndex();
        while (index.hasConflicts()) {
          await resolveAllUsingTheirs(index);
          try {
            await gitRepo.continueRebase(null as any, null as any);
          } catch (e) {
            if (e instanceof Git.Index) {
              // more conflicts
              index = e;
            } else {
              throw e;
            }
          }
        }
      });

      await dispatch(updateStatus(false));
    } catch (e) {
      console.error(e);
      toastr.error('Resolve failed', e.message);
    }
  };
}

export function maybeCommitChanges(message: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const repoPath = Repository.getRepo().rootPath;

    if (!getState().git.status.initialized) {
      return;
    }

    try {
      await accessingRepository(repoPath, async gitRepo => {
        if (!(await hasUncommittedChanges(gitRepo))) {
          return;
        }

        if (!isSignatureConfigured(gitRepo)) {
          throw new Error('git user name and email are not configured');
        }

        await addToGitIgnore(repoPath, ...RES_LOCAL_FILENAMES.toArray());

        await commitAllChanges(gitRepo, message);
      });

      await dispatch(updateStatus(false));
    } catch (e) {
      console.error(e);
      toastr.error('Commit failed', e.message);
    }
  };
}

export function revertAndPush(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const repoPath = Repository.getRepo().rootPath;
    const resetCommitHash = getState().git.markedForReset;

    try {
      await accessingRepository(repoPath, async gitRepo => {
        if (resetCommitHash) {
          const lastCommitToRemove = await gitRepo.getCommit(resetCommitHash);
          const resetToCommit = await lastCommitToRemove.parent(0);

          await Git.Reset.reset(gitRepo, resetToCommit as any, Git.Reset.TYPE.HARD, {});
        }

        const upstream = await Git.Branch.upstream(await gitRepo.head());
        const trackingState = await compareRefs(await gitRepo.head(), upstream);
        if (trackingState.ahead) {
          const remoteName = remoteNameFromRef(upstream);
          await dispatch(gitPushRemote(gitRepo, remoteName));

          toastr.success('', `Pushed ${trackingState.ahead} commit(s) to '${remoteName}'.`);
        }
      });

      if (resetCommitHash) {
        await dispatch(Repository.reload());
      }

      await dispatch(updateStatus(false));
      dispatch(closePopup());
    } catch (e) {
      console.error(e);
      toastr.error('Push failed', e.message);
    }
  };
}

export function openPopup(): Action {
  return {
    type: Actions.OPEN_POPUP
  };
}

export function markForReset(commitHash?: string): Action {
  return {
    type: Actions.MARK_FOR_RESET,
    payload: commitHash
  };
}

export function closePopup(): Action {
  return {
    type: Actions.CLOSE_POPUP
  };
}

export function openClonePopup(): Action {
  return {
    type: Actions.OPEN_CLONE_POPUP
  };
}

export function changeCloneUrl(url: string): Action {
  return {
    type: Actions.CHANGE_CLONE_URL,
    payload: url
  };
}

export function changeCloneTarget(target: string): Action {
  return {
    type: Actions.CHANGE_CLONE_TARGET,
    payload: target
  };
}

export function cloneAndLoad(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { git } = getState();

    if (!git.cloneRemoteUrl || !git.cloneTarget) {
      return;
    }
    // matches last part of URL, without .git
    const m = /.*\/([^\/]+?)(?:\.git)?\/?$/.exec(git.cloneRemoteUrl);
    if (!m) {
      dispatch({ type: Actions.PROGRESS, payload: { done: true, message: 'Error: Invalid URL' } });
      return;
    }
    const repoName = m[1];

    try {
      let cloneTarget = git.cloneTarget;
      await fs.mkdirp(cloneTarget);
      if ((await fs.readdir(cloneTarget)).length) {
        // target is not empty => guess subfolder name
        cloneTarget = path.join(cloneTarget, repoName);
      }
      await fs.mkdirp(cloneTarget);
      if ((await fs.readdir(cloneTarget)).length) {
        // target incl. subfolder is still not empty
        dispatch({type: Actions.PROGRESS, payload: { done: true, message: 'Error: Directory is not empty' }});
        return;
      }

      dispatch({type: Actions.PROGRESS, payload: { message: `Cloning from remote...` }});

      await withCredentials(dispatch, async credentialsCb => {
        const gitRepo = await Git.Clone.clone(git.cloneRemoteUrl!, cloneTarget, {
          fetchOpts: {
            callbacks: {
              credentials: async (url: string, usernameFromUrl: string) => {
                const cred = await credentialsCb(url, usernameFromUrl);
                return Git.Cred.userpassPlaintextNew(cred.username || usernameFromUrl, cred.password);
              },
              certificateCheck: () => 1
            }
          }
        });
        gitRepo.free();
      });

      dispatch(closeClonePopup());
      dispatch({ type: Actions.PROGRESS, payload: { done: true } });
      dispatch(changeAndSave('repositoryPath', cloneTarget));
    } catch (e) {
      dispatch({type: Actions.PROGRESS, payload: { done: true, message: `Error: ${e.message}` }});
    }
  };
}

export function browseForTarget(): Thunk<void> {
  return dispatch => {
    const file = remote.dialog.showOpenDialog(remote.getCurrentWindow(), {
      title: 'Select target folder',
      properties: ['openDirectory']
    });

    if (file && file[0]) {
      dispatch(changeCloneTarget(file[0]));
    }
  };
}

export function closeClonePopup(): Action {
  return {
    type: Actions.CLOSE_CLONE_POPUP
  };
}

afterAction(Repository.Actions.FINISH_LOAD, (dispatch, getState: GetState, isReload) => {
  if (!isReload) {
    dispatch(updateStatus(true));
  }
});

afterAction(Repository.Actions.UNLOAD, (dispatch, getState: GetState) => {
  dispatch(resetStatus());
});

type Action =
  TypedAction<Actions.UPDATE_STATUS, { status: GitStatus, updated: Date }> |
  TypedAction<Actions.PROGRESS, { message?: string, done?: boolean }> |
  OptionalAction<Actions.OPEN_POPUP> |
  OptionalAction<Actions.MARK_FOR_RESET, string> |
  OptionalAction<Actions.CLOSE_POPUP> |
  OptionalAction<Actions.OPEN_CLONE_POPUP> |
  TypedAction<Actions.CHANGE_CLONE_URL, string> |
  TypedAction<Actions.CHANGE_CLONE_TARGET, string> |
  OptionalAction<Actions.CLOSE_CLONE_POPUP>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { status: { initialized: false }, lastStatusUpdate: new Date() }, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_STATUS:
      return { ...state, status: action.payload.status, lastStatusUpdate: action.payload.updated, markedForReset: undefined };
    case Actions.PROGRESS:
      return { ...state, working: !action.payload.done, progressStatus: action.payload.message };
    case Actions.OPEN_POPUP:
      return { ...state, popupOpen: true, markedForReset: undefined };
    case Actions.MARK_FOR_RESET:
      return { ...state, markedForReset: action.payload };
    case Actions.CLOSE_POPUP:
      return { ...state, popupOpen: false };
    case Actions.OPEN_CLONE_POPUP:
      return { ...state, clonePopupOpen: true, cloneRemoteUrl: undefined, cloneTarget: undefined, progressStatus: undefined };
    case Actions.CHANGE_CLONE_URL:
      return { ...state, cloneRemoteUrl: action.payload };
    case Actions.CHANGE_CLONE_TARGET:
      return { ...state, cloneTarget: action.payload };
    case Actions.CLOSE_CLONE_POPUP:
      return { ...state, clonePopupOpen: false };
    default:
      return state;
  }
}
