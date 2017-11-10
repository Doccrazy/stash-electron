import * as assert from 'assert';
import * as Git from 'nodegit';
import { toastr } from 'react-redux-toastr';
import { afterAction } from '../store/eventMiddleware';
import {
  accessingRepository,
  addToGitIgnore,
  commitAllChanges,
  compareRefs,
  fetchWithRetry,
  hasUncommittedChanges,
  isRepository,
  resolveAllUsingTheirs
} from '../utils/git';
import { RES_LOCAL_FILENAMES } from '../utils/repository';
import * as Credentials from './credentials';
import * as Repository from './repository';
import { FetchResult, GitStatus, State } from './types/git';
import { GetState, TypedAction, TypedThunk } from './types/index';

export enum Actions {
  PROGRESS = 'git/PROGRESS',
  UPDATE_STATUS = 'git/UPDATE_STATUS'
}

export function updateStatus(doFetch: boolean): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const repoPath = Repository.getRepo().rootPath;

    const status = await dispatch(determineGitStatus(repoPath, doFetch));
    dispatch({
      type: Actions.UPDATE_STATUS,
      payload: status
    });
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

        const currentRef = await gitRepo.head();
        status.branchName = currentRef.shorthand();

        if (gitRepo.isRebasing() || gitRepo.isMerging()) {
          status.conflict = true;
          return;
        }

        if (gitRepo.headDetached()) {
          status.error = 'detached head';
          return;
        }

        let upstream;
        try {
          upstream = await Git.Branch.upstream(currentRef);
        } catch (e) {
          status.error = 'current branch is not tracking any remote';
          return;
        }
        status.upstreamName = upstream.shorthand();
        const remoteName = (/^refs\/remotes\/([^\/]+)\//.exec(upstream.name()) || [])[1];

        // if not fetching or fetch fails, remember bg mode from last fetch
        status.allowBackgroundFetch = oldStatus.allowBackgroundFetch;

        if (doFetch && remoteName) {
          const fetchResult = await dispatch(gitFetchRemote(gitRepo, remoteName));
          // we can only do background updates if the user saved the credentials
          status.allowBackgroundFetch = fetchResult.allowNonInteractive;
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

        const commit = await gitRepo.getHeadCommit();
        status.headCommit = {
          message: commit.message(),
          author: (commit.author().name as any)(),  // error in typings and docs
          date: commit.date()
        };
      });
    } catch (e) {
      console.error(e);
      status.error = e.message;
    }
    return status;
  };
}

function gitFetchRemote(gitRepo: Git.Repository, remoteName: string): Thunk<Promise<FetchResult>> {
  return async (dispatch, getState) => {
    let credentialsContext: string | null = null;
    dispatch({ type: Actions.PROGRESS, payload: { message: `Fetching from ${remoteName}` } });
    try {
      await fetchWithRetry(gitRepo, remoteName, async (url: string, usernameFromUrl: string) => {
        if (credentialsContext) {
          await dispatch(Credentials.rejectCredentials('Authentication failed'));
        }
        credentialsContext = null;
        const result = await dispatch(Credentials.requestCredentials(url, 'Authenticate to git repository',
          `The git repository at ${url} has requested authentication.
             Please enter your credentials below.`, usernameFromUrl, true));
        credentialsContext = url;
        return result;
      });
      if (credentialsContext) {
        await dispatch(Credentials.acceptCredentials());
      }
      return {
        success: true,
        // for a private repository, background pulls are only possible if the user saved the login
        allowNonInteractive: !credentialsContext || Credentials.hasStoredLogin(getState, credentialsContext)
      };
    } catch (e) {
      if (credentialsContext) {
        await dispatch(Credentials.rejectCredentials('Operation failed'));
        await dispatch(Credentials.close());
      }
      throw e;
    } finally {
      dispatch({ type: Actions.PROGRESS, payload: { done: true } });
    }
  };
}

export function resetStatus(): Action {
  return {
    type: Actions.UPDATE_STATUS,
    payload: {
      initialized: false
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

    if (!isRepository(repoPath)) {
      return;
    }

    try {
      await accessingRepository(repoPath, async gitRepo => {
        if (!(await hasUncommittedChanges(gitRepo))) {
          return;
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

afterAction(Repository.Actions.FINISH_LOAD, (dispatch, getState: GetState) => {
  dispatch(updateStatus(true));
});

afterAction(Repository.Actions.UNLOAD, (dispatch, getState: GetState) => {
  dispatch(resetStatus());
});

type Action =
  TypedAction<Actions.UPDATE_STATUS, GitStatus> |
  TypedAction<Actions.PROGRESS, { message?: string, done?: boolean }>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = { status: { initialized: false } }, action: Action): State {
  switch (action.type) {
    case Actions.UPDATE_STATUS:
      return { ...state, status: action.payload };
    case Actions.PROGRESS:
      return { ...state, working: !action.payload.done, progressStatus: action.payload.message };
    default:
      return state;
  }
}
