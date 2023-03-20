import * as Mousetrap from 'mousetrap';
import * as CurrentEntry from '../actions/currentEntry';
import * as CurrentNode from '../actions/currentNode';
import * as Edit from '../actions/edit';
import * as PrivateKey from '../actions/privateKey';
import { Dispatch, GetState } from '../actions/types/index';
import StashLink from '../domain/StashLink';
import { WellKnownField } from '../fileType';
import PasswordType from '../fileType/password';
import { openStashLink } from './stashLinkHandler';

export default function registerHotkeys(dispatch: Dispatch, getState: GetState) {
  document.documentElement.addEventListener(
    'paste',
    (ev) => {
      if (ev.clipboardData && ev.clipboardData.types.includes('text/plain')) {
        const str = ev.clipboardData.getData('text/plain');
        try {
          StashLink.parse(str);
          // valid link pasted
          ev.preventDefault();
          dispatch(openStashLink(str));
        } catch {
          // no stash link
        }
      }
    },
    true
  );

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

  Mousetrap.bind('mod+n', () => editOp(() => Edit.createInCurrent(PasswordType.id)));
  Mousetrap.bind('mod+shift+n', () => editOp(CurrentNode.startCreate));

  Mousetrap.bind('mod+l', () => {
    if (getState().privateKey.encrypted) {
      if (getState().privateKey.key) {
        dispatch(PrivateKey.lock());
      } else {
        dispatch(PrivateKey.loadAndUnlockInteractive());
      }
    }
  });

  Mousetrap.bind('mod+b', () => dispatch(CurrentEntry.copyToClipboard(WellKnownField.USERNAME)));
  Mousetrap.bind('mod+c', () => dispatch(CurrentEntry.copyToClipboard(WellKnownField.PASSWORD)));
  Mousetrap.bind('mod+u', () => dispatch(CurrentEntry.openUrl()));
  Mousetrap.bind('mod+shift+u', () => dispatch(CurrentEntry.copyToClipboard(WellKnownField.URL)));
}
