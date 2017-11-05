import * as fs from 'fs-extra';
import * as Git from 'nodegit';
import * as path from 'path';
import * as assert from 'assert';

/**
 * Compare two refs to see who is ahead/behind
 * @returns the number of commits each ref is ahead of the common base
 */
export async function compareRefs(left: Git.Reference, right: Git.Reference): Promise<{ left: number, right: number }> {
  const repo = left.owner();

  const leftCommit = await repo.getReferenceCommit(left);
  const rightCommit = await repo.getReferenceCommit(right);
  if (leftCommit.id() === rightCommit.id()) {
    return { left: 0, right: 0 };
  }
  const base = await Git.Merge.base(repo, leftCommit.id(), rightCommit.id());
  return {
    left: await countCommitsToBase(leftCommit, base),
    right: await countCommitsToBase(rightCommit, base)
  };
}

async function countCommitsToBase(commit: Git.Commit, base: Git.Oid) {
  let result = 0;
  while (!commit.id().equal(base) && commit.parentcount() && result < 100) {
    commit = await commit.parent(0);
    result++;
  }
  return result;
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
