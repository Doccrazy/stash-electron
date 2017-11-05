import * as Git from 'nodegit';

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
