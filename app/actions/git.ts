import * as assert from 'assert';
import * as fs from 'fs-extra';
import { Set } from 'immutable';
import * as path from 'path';
import * as Git from 'nodegit';
import { toastr } from 'react-redux-toastr';
import { remote } from 'electron';
import { FILENAME as KEYS_FILE } from '../repository/KeyFileKeyProvider';
import { FILENAME as USERS_FILE, default as UsersFile } from '../repository/UsersFile';
import { afterAction, onceAfterAction } from '../store/eventMiddleware';
import {
  accessingRepository,
  addToGitIgnore,
  commitAllChanges,
  compareRefs,
  fetchWithRetry, finishRebaseResolving, GitCredentials,
  hasUncommittedChanges, isSignatureConfigured,
  pushWithRetry, remoteNameFromRef,
  usingOurs
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
  CLONE_OPEN_POPUP = 'git/OPEN_CLONE_POPUP',
  CLONE_CHANGE_URL = 'git/CHANGE_CLONE_URL',
  CLONE_CHANGE_TARGET = 'git/CHANGE_CLONE_TARGET',
  CLONE_CLOSE_POPUP = 'git/CLOSE_CLONE_POPUP',
  SIGNATURE_OPEN_POPUP = 'git/SIGNATURE_OPEN_POPUP',
  SIGNATURE_CHANGE = 'git/SIGNATURE_CHANGE',
  SIGNATURE_CONFIRM = 'git/SIGNATURE_CONFIRM',
  SIGNATURE_CLOSE_POPUP = 'git/SIGNATURE_CLOSE_POPUP'
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

        let upstream: Git.Reference;
        try {
          upstream = await Git.Branch.upstream(currentRef);
        } catch (e) {
          status.error = 'current branch is not tracking any remote';
          return;
        }
        status.upstreamName = upstream.shorthand();
        const remoteName = remoteNameFromRef(upstream);

        if (!isSignatureConfigured(gitRepo) && (await compareRefs(currentRef, upstream)).ahead) {
          status.error = 'git user name and email are not configured';
          return;
        }

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
          } catch (e) {
            if (e instanceof Git.Index) {
              // rebase failed due to conflicts
              const success = await finishRebaseResolving(gitRepo, conservativeAutoMerge);
              if (!success) {
                status.conflict = true;
                return;
              }
            } else {
              throw e;
            }
          }
          currentRef = await gitRepo.head();
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
      if (e.message === 'cancelled by user') {
        status.allowBackgroundFetch = false;
      }
    }
    return status;
  };
}

function conservativeAutoMerge(filename: string, ours: Buffer, theirs: Buffer, ancestor: Buffer): Buffer | null {
  if (filename === KEYS_FILE) {
    console.log(`auto-merging ${filename}`);
    const ourKeys = JSON.parse(ours.toString('utf8'));
    const theirKeys = JSON.parse(theirs.toString('utf8'));
    const baseKeys = JSON.parse(ancestor.toString('utf8'));

    // take union of both changes (with authority on ours)
    const result = { ...theirKeys, ...ourKeys };

    // apply user removals from both
    const removed = Set(Object.keys(baseKeys)).subtract(Set(Object.keys(ourKeys)).intersect(Set(Object.keys(theirKeys))));
    removed.forEach(r => { delete result[r!]; });

    return Buffer.from(JSON.stringify(result, null, '  '));
  } else if (path.parse(filename).base === USERS_FILE) {
    console.log(`auto-merging ${filename}`);
    const ourUsers = new UsersFile(ours);
    const theirUsers = new UsersFile(theirs);
    const baseUsers = new UsersFile(ancestor);

    // if master keys differ, we cannot merge
    if (!ourUsers.getHashedMasterKey()!.equals(theirUsers.getHashedMasterKey()!)) {
      return null;
    }
    // as the master keys are equal, we can now assume both branches only added or updated users

    // merge their user updates into ours
    for (const username of theirUsers.listUsers()) {
      if (baseUsers.listUsers().includes(username) && !baseUsers.internalGet(username)!.equals(theirUsers.internalGet(username)!)
      && baseUsers.internalGet(username)!.equals(ourUsers.internalGet(username)!)) {
        ourUsers.internalAdd(username, theirUsers.internalGet(username)!);
      }
    }

    // merge their added users into ours
    const addedInTheirs = Set(theirUsers.listUsers()).subtract(baseUsers.listUsers());
    addedInTheirs.forEach((username: string) => {
      if (!ourUsers.listUsers().includes(username)) {
        ourUsers.internalAdd(username, theirUsers.internalGet(username)!);
      }
    });

    return ourUsers.writeBuffer();
  }
  return null;
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

        await finishRebaseResolving(gitRepo, usingOurs);
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
          try {
            const signature = await dispatch(requestSignature());
            const cfg = signature.local ? (await gitRepo.config()) : (await Git.Config.openDefault());
            await cfg.setString('user.name', signature.name);
            await cfg.setString('user.email', signature.email);
          } catch (e) {
            throw new Error('git user name and email are not configured');
          }
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
    type: Actions.CLONE_OPEN_POPUP
  };
}

export function changeCloneUrl(url: string): Action {
  return {
    type: Actions.CLONE_CHANGE_URL,
    payload: url
  };
}

export function changeCloneTarget(target: string): Action {
  return {
    type: Actions.CLONE_CHANGE_TARGET,
    payload: target
  };
}

export function cloneAndLoad(): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { git } = getState();

    if (!git.clone.remoteUrl || !git.clone.target) {
      return;
    }
    // matches last part of URL, without .git
    const m = /.*\/([^\/]+?)(?:\.git)?\/?$/.exec(git.clone.remoteUrl);
    if (!m) {
      dispatch({ type: Actions.PROGRESS, payload: { done: true, message: 'Error: Invalid URL' } });
      return;
    }
    const repoName = m[1];

    try {
      let cloneTarget = git.clone.target;
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
        const gitRepo = await Git.Clone.clone(git.clone.remoteUrl!, cloneTarget, {
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
    type: Actions.CLONE_CLOSE_POPUP
  };
}

export function requestSignature(): Thunk<Promise<{name: string, email: string, local?: boolean}>> {
  return async (dispatch, getState) => {
    dispatch({ type: Actions.SIGNATURE_OPEN_POPUP });

    return new Promise<{name: string, email: string, local?: boolean}>((resolve, reject) => {
      onceAfterAction([Actions.SIGNATURE_CONFIRM, Actions.SIGNATURE_CLOSE_POPUP], () => {
        const { name, email, local } = getState().git.signature;
        if (name && email) {
          resolve({ name, email, local });
        } else {
          reject(new Error('cancelled by user'));
        }
        dispatch(closeSignaturePopup());
      });
    });
  };
}

export function changeSignature(name: string, email: string, local: boolean): Action {
  return {
    type: Actions.SIGNATURE_CHANGE,
    payload: { name, email, local }
  };
}

export function confirmSignature(): Action {
  return {
    type: Actions.SIGNATURE_CONFIRM
  };
}

export function closeSignaturePopup(): Action {
  return {
    type: Actions.SIGNATURE_CLOSE_POPUP
  };
}

afterAction(Repository.Actions.FINISH_LOAD, async (dispatch, getState: GetState, isReload) => {
  if (!isReload) {
    await dispatch(updateStatus(false));
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
  OptionalAction<Actions.CLONE_OPEN_POPUP> |
  TypedAction<Actions.CLONE_CHANGE_URL, string> |
  TypedAction<Actions.CLONE_CHANGE_TARGET, string> |
  OptionalAction<Actions.CLONE_CLOSE_POPUP> |
  OptionalAction<Actions.SIGNATURE_OPEN_POPUP> |
  TypedAction<Actions.SIGNATURE_CHANGE, { name: string, email: string, local: boolean }> |
  OptionalAction<Actions.SIGNATURE_CONFIRM> |
  OptionalAction<Actions.SIGNATURE_CLOSE_POPUP>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = {status: {initialized: false}, lastStatusUpdate: new Date(), clone: {}, signature: {}}, action: Action): State {
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
    case Actions.CLONE_OPEN_POPUP:
      return { ...state, clone: { open: true }, progressStatus: undefined };
    case Actions.CLONE_CHANGE_URL:
      return { ...state, clone: { ...state.clone, remoteUrl: action.payload } };
    case Actions.CLONE_CHANGE_TARGET:
      return { ...state, clone: { ...state.clone, target: action.payload } };
    case Actions.CLONE_CLOSE_POPUP:
      return { ...state, clone: {} };
    case Actions.SIGNATURE_OPEN_POPUP:
      return { ...state, signature: { open: true } };
    case Actions.SIGNATURE_CHANGE:
      return { ...state, signature: { ...state.signature, ...action.payload } };
    case Actions.SIGNATURE_CLOSE_POPUP:
      return { ...state, signature: {} };
    default:
      return state;
  }
}
