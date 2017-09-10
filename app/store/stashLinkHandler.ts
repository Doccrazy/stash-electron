import { ipcRenderer } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { select as selectNode } from '../actions/currentNode';
import { select as selectEntry } from '../actions/currentEntry';
import { expand } from '../actions/treeState';
import {Dispatch} from '../actions/types/index';

function genPartialIds(nodeId: string) {
  let idx = -1;
  const result = [];
  while ((idx = nodeId.indexOf('/', idx + 1)) >= 0) {
    result.push(nodeId.substr(0, idx + 1));
  }
  return result;
}

export default function(dispatch: Dispatch) {
  ipcRenderer.on('stashLink', async (event: string, message: string) => {
    try {
      const ptr = EntryPtr.fromHref(message);
      for (const partialId of genPartialIds(ptr.nodeId).slice(0, -1)) {
        await dispatch(expand(partialId));
      }
      await dispatch(selectNode(ptr.nodeId));
      // TODO the delay is required because selectNode asynchronously clears the selection, and should of course be refactored ;)
      await new Promise(resolve => setTimeout(resolve, 250));
      await dispatch(selectEntry(ptr));
    } catch (e) {
      // failed to parse, ignore
      console.log(`Invalid link ${message}: ${e}`);
    }
  });
}
