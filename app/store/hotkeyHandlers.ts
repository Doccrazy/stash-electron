import * as Mousetrap from 'mousetrap';
import {Dispatch, GetState} from '../actions/types/index';
import EntryPtr from '../domain/EntryPtr';
import {openStashLink} from './stashLinkHandler';
import * as Edit from '../actions/edit';
import * as CurrentNode from '../actions/currentNode';
import * as CurrentEntry from '../actions/currentEntry';
import * as PrivateKey from '../actions/privateKey';

export default function registerHotkeys(dispatch: Dispatch, getState: GetState) {
  document.documentElement.addEventListener('paste', ev => {
    if (ev.clipboardData.types.includes('text/plain')) {
      const str = ev.clipboardData.getData('text/plain');
      try {
        EntryPtr.fromHref(str);
        // valid link pasted
        ev.preventDefault();
        dispatch(openStashLink(str));
      } catch {
        // no stash link
      }
    }
  }, true);

  Mousetrap.bind('f2', () => {
    const { currentNode, currentEntry, edit } = getState();
    if (edit.ptr || currentNode.renaming) {
      return;
    }
    if (currentEntry.ptr) {
      dispatch(Edit.open(currentEntry.ptr));
    } else if (currentNode.nodeId && !currentNode.specialId) {
      dispatch(CurrentNode.startRename());
    }
  });

  Mousetrap.bind('del', () => {
    const { currentNode, currentEntry, edit } = getState();
    if (edit.ptr || currentNode.renaming) {
      return;
    }
    if (currentEntry.ptr) {
      dispatch(CurrentEntry.prepareDelete());
    } else if (currentNode.nodeId && !currentNode.specialId) {
      dispatch(CurrentNode.prepareDelete());
    }
  });

  function editOp(op: () => any) {
    const { currentNode, edit } = getState();
    if (edit.ptr || currentNode.renaming || !currentNode.nodeId || currentNode.specialId) {
      return;
    }
    dispatch(op());
  }

  Mousetrap.bind(['ctrl+n', 'meta+n'], () => editOp(() => Edit.createInCurrent('password')));
  Mousetrap.bind(['ctrl+shift+n', 'meta+shift+n'], () => editOp(CurrentNode.startCreate));

  Mousetrap.bind('ctrl+l', () => {
    if (getState().privateKey.encrypted) {
      if (getState().privateKey.key) {
        dispatch(PrivateKey.lock());
      } else {
        dispatch(PrivateKey.loadAndUnlockInteractive());
      }
    }
  });
}
