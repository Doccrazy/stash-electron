import { List } from 'immutable';
import * as naturalCompare from 'natural-compare';
import { getRepo } from '../actions/repository';
import {RootState} from '../actions/types';
import { GitHistory, OidAndName } from '../actions/types/git';
import EntryPtr from '../domain/EntryPtr';
import { GitCommitInfo } from '../utils/git';
import specialFolders, { SpecialFolderId } from '../utils/specialFolders';

export function fileList(state: RootState): EntryPtr[] {
  if (state.currentNode.specialId) {
    const selector = specialFolders[state.currentNode.specialId as SpecialFolderId].selector;
    return selector(state);
  } else if (state.currentNode.nodeId && state.repository.nodes[state.currentNode.nodeId]) {
    return state.repository.nodes[state.currentNode.nodeId].entries
      .map((entry: string) => new EntryPtr(state.currentNode.nodeId as string, entry))
      .toArray();
  }
  return [];
}

export function sortedFileList(state: RootState): EntryPtr[] {
  const result = fileList(state);
  result.sort((a, b) => naturalCompare(a.entry.toLowerCase(), b.entry.toLowerCase()));
  return result;
}

export function commitsFor(state: RootState, fileName: string | EntryPtr): List<GitCommitInfo> {
  if (!state.git.status.initialized) {
    return List<GitCommitInfo>();
  }
  if (fileName instanceof EntryPtr) {
    fileName = getRepo().resolvePath(fileName.nodeId, fileName.entry);
  }
  return state.git.history.files.get(fileName, List<OidAndName>())
    .map(oidAndName => state.git.history.commits.get(oidAndName.oid)!);
}

export function findHistoricEntry(ptr: EntryPtr, history: GitHistory, commitOid: string) {
  let resolved = getRepo().resolvePath(ptr.nodeId, ptr.entry);
  const oidAndNameAtCommit = history.files.get(resolved, List<OidAndName>())
    .find(oidAndName => oidAndName.oid === commitOid);
  if (oidAndNameAtCommit) {
    resolved = oidAndNameAtCommit.name;
  }

  const u = getRepo().unresolvePath(resolved);
  return new EntryPtr(u.nodeId, u.fileName);
}
