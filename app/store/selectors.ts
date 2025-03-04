import { List, Set } from 'immutable';
import naturalCompare from 'natural-compare';
import { getRepo } from '../actions/repository';
import { RootState } from '../actions/types';
import { GitHistory, OidAndName } from '../actions/types/git';
import EntryPtr from '../domain/EntryPtr';
import FileListEntry from '../domain/FileListEntry';
import { GitCommitInfo } from '../utils/git';
import { hierarchy, isAccessible } from '../utils/repository';
import specialFolders, { SpecialFolderEntry } from '../utils/specialFolders';

export function fileList(state: RootState): EntryPtr[] {
  if (state.currentNode.specialId) {
    const selector = specialFolders[state.currentNode.specialId].selector;
    return selector(state).map((specialEntry) => specialEntry.ptr);
  } else if (state.currentNode.nodeId && state.repository.nodes[state.currentNode.nodeId]) {
    return state.repository.nodes[state.currentNode.nodeId].entries
      .map((entry: string) => new EntryPtr(state.currentNode.nodeId as string, entry))
      .toArray();
  }
  return [];
}

function sortedFileList(state: RootState): EntryPtr[] {
  const result = fileList(state);
  result.sort((a, b) => naturalCompare(a.entry.toLowerCase(), b.entry.toLowerCase()));
  return result;
}

export function sortedFileListWithDetails(state: RootState): FileListEntry[] {
  let specialFileList: SpecialFolderEntry[];
  if (state.currentNode.specialId) {
    const selector = specialFolders[state.currentNode.specialId].selector;
    specialFileList = selector(state);
    specialFileList.sort((a, b) => {
      const group = (b.groupIndex || 0) - (a.groupIndex || 0);
      return group !== 0 ? group : naturalCompare(a.ptr.entry.toLowerCase(), b.ptr.entry.toLowerCase());
    });
  } else {
    specialFileList = sortedFileList(state).map((ptr) => ({ ptr }));
  }

  const accessibleByNode: { [nodeId: string]: boolean } = Set(specialFileList.map(({ ptr }) => ptr.nodeId)).reduce(
    (acc, id: string) => ({ ...acc, [id]: isAccessible(state.repository.nodes, id, state.privateKey.username) }),
    {}
  );
  const fileListEntries = specialFileList.map(
    ({ ptr, groupIndex, highlightHtml }): FileListEntry => ({
      ptr: ptr,
      path: hierarchy(state.repository.nodes, ptr.nodeId),
      details: state.entryDetails.get(ptr),
      accessible: accessibleByNode[ptr.nodeId],
      groupIndex,
      highlightHtml
    })
  );
  return state.settings.current.hideInaccessible ? fileListEntries.filter((e) => e.accessible) : fileListEntries;
}

export function commitsFor(state: RootState, fileName: string | EntryPtr, filter?: (c: GitCommitInfo) => boolean): List<GitCommitInfo> {
  if (!state.git.status.initialized) {
    return List<GitCommitInfo>();
  }
  if (fileName instanceof EntryPtr) {
    fileName = getRepo().resolvePath(fileName.nodeId, fileName.entry);
  }
  return state.git.history.files
    .get(fileName, List<OidAndName>())
    .map((oidAndName) => state.git.history.commits.get(oidAndName.oid)!)
    .filter((commit) => !filter || filter(commit));
}

// filter excluding commits that changed folder authorization
export function excludingAuth(commit: GitCommitInfo) {
  return !!commit.changedFiles && !commit.changedFiles.find((fn) => fn.endsWith('/.users.json'));
}

export function findHistoricEntry(ptr: EntryPtr, history: GitHistory, commitOid: string) {
  let resolved = getRepo().resolvePath(ptr.nodeId, ptr.entry);
  const oidAndNameAtCommit = history.files.get(resolved, List<OidAndName>()).find((oidAndName) => oidAndName.oid === commitOid);
  if (oidAndNameAtCommit) {
    resolved = oidAndNameAtCommit.name;
  }

  const u = getRepo().unresolvePath(resolved);
  return new EntryPtr(u.nodeId, u.fileName);
}
