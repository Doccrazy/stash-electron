import { ipcRenderer, clipboard } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { select as selectNode } from '../actions/currentNode';
import { select as selectEntry } from '../actions/currentEntry';
import { expand } from '../actions/treeState';
import {Dispatch, Thunk} from '../actions/types/index';
import {toastr} from 'react-redux-toastr';
import StashLink from '../domain/StashLink';
import { t } from '../utils/i18n/redux';
import {onceAfterAction} from './eventMiddleware';
import * as Repository from '../actions/repository';
import {hierarchy} from '../utils/repository';

export function openStashLink(link: string, silent?: boolean): Thunk<Promise<boolean>> {
  return async (dispatch, getState) => {
    const { repository } = getState();
    if (!repository.path || repository.loading) {
      onceAfterAction(Repository.Actions.FINISH_LOAD, () => dispatch(openStashLink(link)));
      return true;
    }

    try {
      console.log('Opening link: ', link);

      const stashLink = StashLink.parse(link);
      const hier = hierarchy(repository.nodes, stashLink.nodeId);
      if (!hier.length) {
        if (!silent) {
          toastr.error(t('utils.stashLink.error.title'), t('utils.stashLink.error.noFolder'));
        }
        return false;
      }

      for (const node of hier.slice(0, -1)) {
        await dispatch(expand(node.id));
      }
      await dispatch(selectNode(stashLink.nodeId));
      if (stashLink.isEntry()) {
        // TODO the delay is required because selectNode asynchronously clears the selection, and should of course be refactored ;)
        await new Promise(resolve => setTimeout(resolve, 250));
        if (!await dispatch(selectEntry(stashLink.toEntryPtr()))) {
          if (!silent) {
            toastr.error(t('utils.stashLink.error.title'), t('utils.stashLink.error.notFound'));
          }
        }
      }
      return true;
    } catch (e) {
      // failed to parse, ignore
      console.error(e);
      if (!silent) {
        toastr.error(t('utils.stashLink.error.title'), `${link}: ${e}`);
      }
      return false;
    }
  };
}

export function copyStashLink(ptrOrNodeId: EntryPtr | string) {
  clipboard.writeText(new StashLink(ptrOrNodeId).toUri());
  toastr.success('', t('utils.stashLink.copied', {type: typeof ptrOrNodeId === 'string' ? 'folder' : 'entry'}), {timeOut: 2000});
}

export default function(dispatch: Dispatch) {
  ipcRenderer.on('stashLink', (event, message: string) => {
    dispatch(openStashLink(message));
  });
}
