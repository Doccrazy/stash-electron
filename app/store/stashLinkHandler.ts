import { ipcRenderer } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { select as selectNode } from '../actions/currentNode';
import { select as selectEntry } from '../actions/currentEntry';
import { expand } from '../actions/treeState';
import {Dispatch, Thunk} from '../actions/types/index';
import {toastr} from 'react-redux-toastr';
import {onceAfterAction} from './eventMiddleware';
import * as Repository from '../actions/repository';
import {hierarchy} from '../utils/repository';

function openStashLink(link: string): Thunk<Promise<void>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    if (repository.loading) {
      onceAfterAction(Repository.Actions.FINISH_LOAD, () => dispatch(openStashLink(link)));
      return;
    }

    try {
      console.log('Opening link: ', link);

      const ptr = EntryPtr.fromHref(link);
      const hier = hierarchy(repository.nodes, ptr.nodeId);
      if (!hier.length) {
        toastr.error('Invalid link', 'Folder does not exist');
        return;
      }

      for (const node of hier.slice(0, -1)) {
        await dispatch(expand(node.id));
      }
      await dispatch(selectNode(ptr.nodeId));
      // TODO the delay is required because selectNode asynchronously clears the selection, and should of course be refactored ;)
      await new Promise(resolve => setTimeout(resolve, 250));
      await dispatch(selectEntry(ptr));
    } catch (e) {
      // failed to parse, ignore
      console.error(e);
      toastr.error('Invalid link', `${link}: ${e}`);
    }
  };
}

export default function(dispatch: Dispatch) {
  ipcRenderer.on('stashLink', (event: string, message: string) => {
    dispatch(openStashLink(message));
  });
}
