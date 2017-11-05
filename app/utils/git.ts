import * as fs from 'fs-extra';
import * as Git from 'nodegit';
import * as path from 'path';
import * as assert from 'assert';

export interface AheadBehindResult {
  ahead: number,
  behind: number
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

    // write "their" content into the file
    const theirBlob = await repo.getBlob(conflict.their_out.id);
    await fs.writeFile(path.join(repo.workdir(), entry.path), theirBlob.content());

    // mark file as resolved
    await index.addByPath(entry.path);  // another doc/typings error: method actually returns a promise
  }
  await index.write();
  await index.writeTree();
  assert.ok(!index.hasConflicts(), 'all conflicts should be resolved');
}
