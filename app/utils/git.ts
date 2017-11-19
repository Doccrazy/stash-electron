import * as fs from 'fs-extra';
import * as Git from 'nodegit';
import * as path from 'path';
import * as assert from 'assert';
import { OrderedSet } from 'immutable';
import AwaitLock from './AwaitLock';

export interface AheadBehindResult {
  ahead: number,
  behind: number
}

export interface GitCredentials {
  username?: string,
  password: string
}

export function isRepository(repoPath: string) {
  return fs.existsSync(path.join(repoPath, '.git/index'));
}

export function isSignatureConfigured(repo: Git.Repository) {
  return !!Git.Signature.default(repo) && !!(Git.Signature.default(repo).name as any)() && !!(Git.Signature.default(repo).email as any)();
}

/**
 * nodegit APIs are not thread-safe and may throw anything from 'index busy' to segfaults, so we
 * need to prevent concurrent repo access.
 * Note: Lock is not reentrant, make sure not to call recursively!
 */
const repoLock = new AwaitLock();
export async function accessingRepository(repoPath: string, callback: (repo: Git.Repository) => any): Promise<void> {
  await repoLock.acquireAsync();
  try {
    const repo = await Git.Repository.open(repoPath);
    await callback(repo);
  } finally {
    repoLock.release();
  }
}

/**
 * Compare two refs to see who is ahead/behind
 * @returns the number of commits each ref is ahead of the common base
 */
export async function compareRefs(local: Git.Reference, origin: Git.Reference): Promise<AheadBehindResult> {
  const repo = local.owner();

  const localCommit = await repo.getReferenceCommit(local);
  const originCommit = await repo.getReferenceCommit(origin);
  if (localCommit.id() === originCommit.id()) {
    return { ahead: 0, behind: 0 };
  }
  return (await Git.Graph.aheadBehind(repo, localCommit.id(), originCommit.id())) as any as AheadBehindResult;  // yet another nodegit foo
}

interface ConflictEntry {
  ancestor_out: Git.IndexEntry,
  our_out: Git.IndexEntry,
  their_out: Git.IndexEntry
}

export async function resolveAllUsingTheirs(index: Git.Index) {
  if (!index.hasConflicts()) {
    return;
  }
  const repo = index.owner();
  for (const entry of index.entries().filter(e => Git.Index.entryStage(e) === 1 && Git.Index.entryIsConflict(e))) {
    console.log(`resolving ${entry.path}`);
    const conflict = (await index.conflictGet(entry.path)) as any as ConflictEntry;  // error in nodegit docs/typings

    // here "our" refers to the upstream/master branch, as we are rebasing another branch (the local changes) onto it
    // write "our" content into the file
    const ourBlob = await repo.getBlob(conflict.our_out.id);
    await fs.writeFile(path.join(repo.workdir(), entry.path), ourBlob.content());

    // mark file as resolved
    await index.addByPath(entry.path);  // another doc/typings error: method actually returns a promise
  }
  await index.write();
  await index.writeTree();
  assert.ok(!index.hasConflicts(), 'all conflicts should be resolved');
}

/**
 * retries a git fetch up to 10 times iff the dreaded 'SSL error: unknown error' error occurs, reusing credentials where applicable
 */
export async function fetchWithRetry(repo: Git.Repository, remote: string, credentialsCb: (url: string, usernameFromUrl: string) => Promise<GitCredentials>) {
  let lastCred: GitCredentials | null = null;
  let errorCred: GitCredentials | null = null;
  for (let i = 0; i < 10; i++) {
    try {
      return await repo.fetch(remote, {
        callbacks: {
          credentials: async (url: string, usernameFromUrl: string) => {
            lastCred = !lastCred && errorCred ? errorCred : await credentialsCb(url, usernameFromUrl);
            return Git.Cred.userpassPlaintextNew(lastCred.username || usernameFromUrl, lastCred.password);
          },
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

export async function pushWithRetry(repo: Git.Repository, remote: string, credentialsCb: (url: string, usernameFromUrl: string) => Promise<GitCredentials>) {
  const gitRemote = await repo.getRemote(remote, null as any);
  await gitRemote.push([(await repo.head()).name()], {
    callbacks: {
      credentials: async (url: string, usernameFromUrl: string) => {
        const cred = await credentialsCb(url, usernameFromUrl);
        return Git.Cred.userpassPlaintextNew(cred.username || usernameFromUrl, cred.password);
      },
      certificateCheck: () => 1
    }
  }, null as any);
}

export async function hasUncommittedChanges(repo: Git.Repository) {
  const statusList = await repo.getStatus({ flags: Git.Status.OPT.INCLUDE_UNTRACKED | Git.Status.OPT.RECURSE_UNTRACKED_DIRS });
  return statusList.length > 0;
}

export async function commitAllChanges(repo: Git.Repository, message: string): Promise<Git.Oid | null> {
  const statusList = await repo.getStatus({ flags: Git.Status.OPT.INCLUDE_UNTRACKED | Git.Status.OPT.RECURSE_UNTRACKED_DIRS });
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
    await index.write();
    const oid = await index.writeTree();

    const parents: Git.Commit[] = [];
    if (!repo.headUnborn()) {
      parents.push(await repo.getHeadCommit());
    }
    return repo.createCommit('HEAD', repo.defaultSignature(), repo.defaultSignature(), message, oid, parents);
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
  return (/^refs\/remotes\/([^\/]+)\//.exec(ref.name()) || [])[1];
}
