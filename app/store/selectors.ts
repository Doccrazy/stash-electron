import * as naturalCompare from 'natural-compare';
import {RootState} from '../actions/types';
import EntryPtr from '../domain/EntryPtr';
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
