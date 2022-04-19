import * as fs from 'fs-extra';
import { Minimatch } from 'minimatch';
import Git from 'nodegit';
import * as path from 'path';
import { OrderedSet } from 'immutable';
import * as SshPK from 'sshpk';
import EncryptedRepository from '../repository/Encrypted';
import GitFileSystem from '../repository/fs/GitFileSystem';
import KeyFileKeyProvider from '../repository/KeyFileKeyProvider';
import UsersFileAuthorizationProvider from '../repository/UsersFileAuthorizationProvider';
import AwaitLock from './AwaitLock';

export interface AheadBehindResult {
  ahead: number;
  behind: number;
}

export interface GitCredentials {
  username?: string;
  password: string;
}

export interface GitCommitInfo {
  hash: string;
  message: string;
  authorName: string;
  authorEmail: string;
  date: Date;
  pushed?: boolean;
  conflict?: boolean;
  remoteRef?: string;
  changedFiles?: string[];
  renamedFiles?: { [newFn: string]: string };
  deletedFiles?: string[];
}

export function isRepository(repoPath: string) {
  return fs.existsSync(path.join(repoPath, '.git/index'));
}

export async function isSignatureConfigured(repo: Git.Repository) {
  try {
    const defaultSignature = await Git.Signature.default(repo);
    return !!defaultSignature && !!defaultSignature.name() && !!defaultSignature.email();
  } catch (err) {
    if (err.errno === Git.Error.CODE.ENOTFOUND) {
      return false;
    }
    throw err;
  }
}

/**
 * nodegit APIs are not thread-safe and may throw anything from 'index busy' to segfaults, so we
 * need to prevent concurrent repo access.
 * Note: Lock is not reentrant, make sure not to call recursively!
 */
const repoLock = new AwaitLock();
export async function accessingRepository<T>(repoPath: string, callback: (repo: Git.Repository) => T | Promise<T>): Promise<T> {
  await repoLock.acquireAsync();
  try {
    const repo = await Git.Repository.open(repoPath);
    return await callback(repo);
  } finally {
    repoLock.release();
  }
}

/**
 * Compare two refs to see who is ahead/behind
 * @returns the number of commits each ref is ahead of the common base
 */
export async function compareRefs(local: Git.Reference, origin?: Git.Reference): Promise<AheadBehindResult> {
  const repo = local.owner();

  const localCommit = await repo.getReferenceCommit(local);
  if (!origin) {
    return { ahead: await totalCommitCount(localCommit), behind: 0 };
  }
  const originCommit = await repo.getReferenceCommit(origin);
  if (localCommit.id() === originCommit.id()) {
    return { ahead: 0, behind: 0 };
  }
  return ((await Git.Graph.aheadBehind(repo, localCommit.id(), originCommit.id())) as any) as AheadBehindResult; // yet another nodegit foo
}

async function totalCommitCount(commit: Git.Commit) {
  let commitCount = 1;
  while (commit.parentcount() > 0) {
    commit = await commit.parent(0);
    commitCount++;
  }
  return commitCount;
}

interface ConflictEntry {
  ancestor_out: Git.IndexEntry;
  our_out: Git.IndexEntry;
  their_out: Git.IndexEntry;
}

/**
 * Try to resolve all conflicts in current index using passed resolver
 * @returns {Promise<boolean>} true if all conflicts have been resolved, false if conflicts remain
 */
export async function resolveAll(repo: Git.Repository, index: Git.Index, resolver: typeof usingOurs): Promise<boolean> {
  if (!index.hasConflicts()) {
    return true;
  }
  let changed = false;
  for (const entry of index.entries().filter((e) => Git.Index.entryStage(e) === 1 && Git.Index.entryIsConflict(e))) {
    console.log(`resolving ${entry.path}`);
    const conflict = ((await index.conflictGet(entry.path)) as any) as ConflictEntry; // error in nodegit docs/typings

    const ourBlob = await repo.getBlob(conflict.our_out.id);
    const theirBlob = await repo.getBlob(conflict.their_out.id);
    const ancestorBlob = await repo.getBlob(conflict.ancestor_out.id);

    // write content returned by resolver into the file
    const resolved = resolver(entry.path, ourBlob.content(), theirBlob.content(), ancestorBlob.content());
    if (resolved) {
      await fs.writeFile(path.join(repo.workdir(), entry.path), resolved);

      // mark file as resolved
      await index.addByPath(entry.path); // another doc/typings error: method actually returns a promise
      changed = true;
    } else {
      // resolver failed, write "theirs" (probably the local changes) to eliminate conflict markers,
      // but do not mark as resolved
      await fs.writeFile(path.join(repo.workdir(), entry.path), theirBlob.content());
    }
  }
  if (changed) {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await index.write();
    await index.writeTree();
  }

  return !index.hasConflicts();
}

// here "our" refers to the upstream/master branch, as we are rebasing another branch (the local changes) onto it
export function usingOurs(filename: string, ours: Buffer, theirs: Buffer, ancestor: Buffer): Buffer | null {
  return ours;
}

export async function finishRebaseResolving(gitRepo: Git.Repository, resolver: typeof usingOurs): Promise<boolean> {
  if (!gitRepo.isRebasing()) {
    return true;
  }

  let index = await gitRepo.refreshIndex();
  while (index.hasConflicts()) {
    if (!(await resolveAll(gitRepo, index, resolver))) {
      return false;
    }
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
  return true;
}

/**
 * retries a git fetch up to 10 times iff the dreaded 'SSL error: unknown error' error occurs, reusing credentials where applicable
 */
export async function fetchWithRetry(
  repo: Git.Repository,
  remote: string,
  credentialsCb: (url: string, usernameFromUrl: string) => Promise<GitCredentials>
) {
  let lastCred: GitCredentials | null = null;
  let errorCred: GitCredentials | null = null;
  for (let i = 0; i < 10; i++) {
    try {
      return await repo.fetch(remote, {
        callbacks: {
          credentials: defaultCredCb(async (url: string, usernameFromUrl: string) => {
            lastCred = !lastCred && errorCred ? errorCred : await credentialsCb(url, usernameFromUrl);
            return lastCred;
          }),
          certificateCheck: () => 1
        }
      });
    } catch (e) {
      if (e.message !== 'SSL error: unknown error') {
        throw e;
      }
      console.warn(`'${e.message}' on fetch retry ${i}`);
      errorCred = lastCred;
      lastCred = null;
    }
  }
  throw new Error('SSL error: unknown error');
}

export async function pushWithRetry(
  repo: Git.Repository,
  remote: string,
  credentialsCb: (url: string, usernameFromUrl: string) => Promise<GitCredentials>
) {
  const gitRemote = await repo.getRemote(remote);
  let errorMessage;
  await gitRemote.push([(await repo.head()).name()], {
    callbacks: {
      credentials: defaultCredCb(credentialsCb),
      certificateCheck: () => 1,
      pushUpdateReference: (refname, status) => {
        if (status) {
          errorMessage = status;
        }
      }
    }
  });
  if (errorMessage) {
    throw new Error(errorMessage);
  }
}

/**
 * For use in Git.FetchOptions.callbacks.credentials
 */
export function defaultCredCb(credentialsCb: (url: string, usernameFromUrl: string) => Promise<GitCredentials>) {
  let sshAgentAttempted = false;
  return async (url: string, usernameFromUrl: string, allowedTypes: number) => {
    if (allowedTypes & Git.Cred.TYPE.SSH_KEY) {
      // tslint:disable-line
      if (sshAgentAttempted) {
        // ssh agent did not provide valid credentials
        throw new Error();
      }
      sshAgentAttempted = true;
      return Git.Cred.sshKeyFromAgent(usernameFromUrl);
    }
    const cred = await credentialsCb(url, usernameFromUrl);
    return Git.Cred.userpassPlaintextNew(cred.username || usernameFromUrl, cred.password);
  };
}

export async function hasUncommittedChanges(repo: Git.Repository) {
  const statusList = await repo.getStatus({ flags: Git.Status.OPT.INCLUDE_UNTRACKED | Git.Status.OPT.RECURSE_UNTRACKED_DIRS }); // tslint:disable-line
  return statusList.length > 0;
}

export async function commitAllChanges(repo: Git.Repository, message: string): Promise<Git.Oid | null> {
  const statusList = await repo.getStatus({ flags: Git.Status.OPT.INCLUDE_UNTRACKED | Git.Status.OPT.RECURSE_UNTRACKED_DIRS }); // tslint:disable-line
  const index = await repo.refreshIndex();
  let uncommittedChanges;
  for (const file of statusList) {
    uncommittedChanges = true;
    if (!file.inWorkingTree()) {
      continue;
    }
    if (file.isDeleted()) {
      await index.removeByPath(file.path());
    } else {
      await index.addByPath(file.path());
    }
  }
  if (uncommittedChanges) {
    // eslint-disable-next-line @typescript-eslint/await-thenable
    await index.write();
    const oid = await index.writeTree();

    const parents: Git.Commit[] = [];
    if (!repo.headUnborn()) {
      parents.push(await repo.getHeadCommit());
    }
    // eslint-disable-next-line @typescript-eslint/await-thenable
    return repo.createCommit('HEAD', await repo.defaultSignature(), await repo.defaultSignature(), message, oid, parents);
  }
  return null;
}

export async function addToGitIgnore(repoPath: string, ...ignoreEntries: string[]): Promise<void> {
  const gitIgnoreFn = path.join(repoPath, '.gitignore');
  let patterns = fs.existsSync(gitIgnoreFn) ? OrderedSet((await fs.readFile(gitIgnoreFn, 'utf8')).split(/\r?\n/)) : OrderedSet<string>();
  let modified;
  for (const ignore of ignoreEntries) {
    if (!patterns.includes(ignore)) {
      patterns = patterns.add(ignore);
      modified = true;
    }
  }
  if (modified) {
    await fs.writeFile(gitIgnoreFn, patterns.join('\n'));
  }
}

export function formatStatusLine(ahead: number | undefined, upstreamName: string, short?: boolean) {
  if (ahead) {
    return `${short ? 'A' : 'Your branch is a'}head of '${upstreamName}' by ${ahead} commit${ahead > 1 ? 's' : ''}.`;
  } else {
    return `${short ? 'U' : 'Your branch is u'}p-to-date with '${upstreamName}'.`;
  }
}

export function remoteNameFromRef(ref: Git.Reference) {
  return (/^refs\/remotes\/([^/]+)\//.exec(ref.name()) || [])[1];
}

function remoteNameFromRefShortName(ref: string) {
  return (/^([^/]+)\//.exec(ref) || [])[1];
}

export function commitInfo(commit: Git.Commit): GitCommitInfo {
  return {
    hash: commit.id().tostrS(),
    message: commit.message(),
    authorName: commit.author().name(),
    authorEmail: commit.author().email(),
    date: commit.date()
  };
}

/**
 * For each given file, fetches the commit where the file has last been changed
 * @param gitRepo
 * @param entries files to fetch history for
 * @param excludePatterns fnmatch patterns that, when matched, cause a commit to be skipped
 * @returns {Promise} promise for a map of commit infos keyed by the passed entries
 */
export async function getLatestCommitsFor(gitRepo: Git.Repository, entries: string[], ...excludePatterns: string[]) {
  const latestCommits: { [entry: string]: GitCommitInfo } = {};
  const oldestCommits: { [entry: string]: GitCommitInfo } = {};

  const walker = gitRepo.createRevWalk();
  walker.pushHead();
  walker.sorting(Git.Revwalk.SORT.TOPOLOGICAL | Git.Revwalk.SORT.TIME); // tslint:disable-line

  // performance can be optimized quite a bit by batching the commits and diffs fetched from libgit
  const BATCH_SIZE = 100;

  console.time('walk');

  const opts: Git.DiffOptions = { flags: Git.Diff.OPTION.FORCE_BINARY, pathspec: [...entries, ...excludePatterns] };

  const excludeMatchers = excludePatterns.map((pat) => new Minimatch(pat));
  let allCommits: Git.Commit[];
  do {
    allCommits = await walker.getCommits(BATCH_SIZE);
    const commitDiffs = await Promise.all(allCommits.map((c) => c.getDiffWithOptions(opts as any)));
    outer: for (let i = 0; i < commitDiffs.length; i++) {
      const commit = allCommits[i];
      const changedFiles: string[] = [];
      for (const diff of commitDiffs[i]) {
        for (let deltaIdx = 0; deltaIdx < diff.numDeltas(); deltaIdx++) {
          const entry = diff.getDelta(deltaIdx).newFile().path();
          changedFiles.push(entry);
        }
        for (const entry of changedFiles) {
          if (entries.includes(entry)) {
            oldestCommits[entry] = commitInfo(commit);
          }
        }
        // if commit has any of the excluded files, skip it
        if (excludeMatchers.find((m) => !!changedFiles.find((fn) => m.match(fn)))) {
          continue outer;
        }
        for (const entry of changedFiles) {
          if (entries.includes(entry) && !latestCommits[entry]) {
            latestCommits[entry] = commitInfo(commit);
          }
        }
      }
    }
  } while (allCommits.length === BATCH_SIZE && Object.keys(latestCommits).length < entries.length);
  // if no commit has been found considering the exclude patterns, use the commit where the file first appeared
  for (const entry of entries) {
    if (!latestCommits[entry]) {
      latestCommits[entry] = oldestCommits[entry];
    }
  }
  console.timeEnd('walk');

  return latestCommits;
}

/**
 * Loads all commits in the given repository with changed files
 */
export async function loadHistory(gitRepo: Git.Repository): Promise<GitCommitInfo[]> {
  let upstream: Git.Reference | undefined;
  let rebaseBase: Git.Oid | undefined;
  try {
    let branch = await gitRepo.head();
    if (gitRepo.isRebasing()) {
      const rebase = await Git.Rebase.open(gitRepo);
      const branchName = (rebase as any).origHeadName();
      if (branchName) {
        branch = await gitRepo.getReference(branchName);
      }
    }
    upstream = await Git.Branch.upstream(branch);
    if (gitRepo.isRebasing()) {
      rebaseBase = await Git.Merge.base(gitRepo, branch.target(), upstream.target());
    }
  } catch (e) {
    // no tracked remote
  }

  const walker = gitRepo.createRevWalk();
  walker.pushHead();
  walker.sorting(Git.Revwalk.SORT.TOPOLOGICAL | Git.Revwalk.SORT.TIME); // tslint:disable-line

  // performance can be optimized quite a bit by batching the commits and diffs fetched from libgit
  const BATCH_SIZE = 100;

  console.time('walk');

  const opts: Git.DiffOptions = { flags: Git.Diff.OPTION.FORCE_BINARY };
  const simOpts: Git.DiffFindOptions = { flags: Git.Diff.FIND.RENAMES | Git.Diff.FIND.EXACT_MATCH_ONLY }; // tslint:disable-line

  const result: GitCommitInfo[] = [];
  let allCommits: Git.Commit[];
  let ahead = true;
  let conflict = !!rebaseBase;
  do {
    allCommits = await walker.getCommits(BATCH_SIZE);
    const commitDiffs = await Promise.all(allCommits.map((c) => c.getDiffWithOptions(opts as any)));
    await Promise.all(
      commitDiffs
        .reduce((acc, diffs) => {
          acc.push(...diffs);
          return acc;
        }, [])
        .map((d) => d.findSimilar(simOpts))
    );
    for (let i = 0; i < commitDiffs.length; i++) {
      const info = commitInfo(allCommits[i]);
      if (upstream && allCommits[i].id().equal(upstream.target())) {
        ahead = false;
        info.remoteRef = upstream.shorthand();
      }
      if (conflict && rebaseBase && allCommits[i].id().equal(rebaseBase)) {
        conflict = false;
      }
      info.pushed = !ahead;
      info.conflict = conflict;
      info.changedFiles = [];
      info.renamedFiles = {};
      info.deletedFiles = [];
      for (const diff of commitDiffs[i]) {
        for (let deltaIdx = 0; deltaIdx < diff.numDeltas(); deltaIdx++) {
          const diffDelta = diff.getDelta(deltaIdx);
          const entry: string = diffDelta.newFile().path();
          const oldEntry: string = diffDelta.oldFile().path();
          const status: Git.Diff.DELTA = diffDelta.status();
          if (status === Git.Diff.DELTA.DELETED) {
            info.deletedFiles.push(entry);
          } else {
            if (status === Git.Diff.DELTA.RENAMED) {
              info.renamedFiles[entry] = oldEntry;
            }
            info.changedFiles.push(entry);
          }
        }
      }
      result.push(info);
    }
  } while (allCommits.length === BATCH_SIZE);
  console.timeEnd('walk');

  return result;
}

export async function loadBlobs(gitRepo: Git.Repository, commits: GitCommitInfo[], filename: string) {
  const gitCommits = await Promise.all(commits.map((c) => c.hash).map((oid) => gitRepo.getCommit(oid)));
  const entries = await Promise.all(gitCommits.map((c) => c.getEntry(filename)));
  const blobs = await Promise.all(entries.map((e) => e.getBlob()));
  return blobs.map((blob) => blob.content());
}

export async function createGitRepository(gitRepo: Git.Repository, commitOid: string, privateKey: SshPK.PrivateKey | undefined) {
  const gitFs = await GitFileSystem.create(gitRepo, commitOid);

  const keyProvider = await KeyFileKeyProvider.create(gitRepo.workdir(), gitFs);
  const authProvider = new UsersFileAuthorizationProvider(gitRepo.workdir(), keyProvider, gitFs);
  authProvider.setCurrentUser(privateKey);

  return new EncryptedRepository(gitRepo.workdir(), authProvider, gitFs);
}

export async function getRootCommit(gitRepo: Git.Repository): Promise<GitCommitInfo | undefined> {
  const walker = gitRepo.createRevWalk();
  walker.pushHead();
  walker.sorting(Git.Revwalk.SORT.TOPOLOGICAL | Git.Revwalk.SORT.TIME | Git.Revwalk.SORT.REVERSE); // tslint:disable-line

  const commits = await walker.getCommits(1);
  return commits.length > 0 ? commitInfo(commits[0]) : undefined;
}

export function upstreamNameFromNodegitError(e: any) {
  // there is no function in nodegit to determine the upstream name without trying to resolve it
  const upstreamGone = /reference 'refs\/remotes\/([^']+)' not found/.exec(e.message);
  if (e.errno === Git.Error.CODE.ENOTFOUND && upstreamGone) {
    return upstreamGone[1];
  }
  return null;
}

export async function getUpstreamStatus(ref: Git.Reference) {
  let upstreamRef: Git.Reference | undefined;
  let upstreamName: string | undefined;
  let remoteName: string;
  try {
    upstreamRef = await Git.Branch.upstream(ref);
    upstreamName = upstreamRef.shorthand();
    remoteName = remoteNameFromRef(upstreamRef);
  } catch (e) {
    const us = upstreamNameFromNodegitError(e);
    if (!us) {
      return null;
    }
    upstreamName = us;
    remoteName = remoteNameFromRefShortName(upstreamName);
  }

  return { ref: upstreamRef, shortName: upstreamName, remoteName };
}

export async function determineConflictingFiles(repo: Git.Repository) {
  const index = await repo.index();
  return [
    ...new Set(
      index
        .entries()
        .filter(Git.Index.entryIsConflict)
        .map((entry) => entry.path)
    )
  ].sort();
}
