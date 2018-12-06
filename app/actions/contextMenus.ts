import { remote } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { ROOT_ID } from '../domain/Node';
import { typeFor, WellKnownField } from '../fileType';
import { copyStashLink } from '../store/stashLinkHandler';
import { isAccessible } from '../utils/repository';
import { open as openPermissions } from './authorizedUsers';
import { copyToClipboard, prepareDelete as prepareDeleteEntry } from './currentEntry';
import { prepareDelete as prepareDeleteNode } from './currentNode';
import { open } from './edit';
import { open as openNodeHistory } from './nodeHistory';
import { Thunk } from './types';

const { Menu, MenuItem } = remote;

export function entryContextMenu(ptr: EntryPtr): Thunk<void> {
  return (dispatch, getState) => {
    const accessible = isAccessible(getState().repository.nodes, ptr.nodeId, getState().privateKey.username);

    const menu = new Menu();
    if (accessible) {
      menu.append(new MenuItem({
        label: 'Edit', accelerator: 'F2', icon: remote.nativeImage.createFromDataURL(require('../icon-pencil.png')), click() {
          dispatch(open(ptr));
        }
      }));
      if (typeFor(ptr.entry).readField) {
        menu.append(new MenuItem({
          label: 'Copy username', accelerator: 'Ctrl+B', icon: remote.nativeImage.createFromDataURL(require('../icon-user.png')), click() {
            dispatch(copyToClipboard(WellKnownField.USERNAME, ptr));
          }
        }));
        menu.append(new MenuItem({
          label: 'Copy password', accelerator: 'Ctrl+C', icon: remote.nativeImage.createFromDataURL(require('../icon-key.png')), click() {
            dispatch(copyToClipboard(WellKnownField.PASSWORD, ptr));
          }
        }));
      }
    }
    menu.append(new MenuItem({label: 'Share link', icon: remote.nativeImage.createFromDataURL(require('../icon-share.png')), click() {
      copyStashLink(ptr);
    }}));
    if (accessible) {
      menu.append(new MenuItem({type: 'separator'}));
      menu.append(new MenuItem({label: 'Delete', accelerator: 'Delete', icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() {
        dispatch(prepareDeleteEntry(ptr));
      }}));
    }
    menu.popup({window: remote.getCurrentWindow()});
  };
}

export function nodeContextMenu(nodeId: string): Thunk<void> {
  return (dispatch, getState) => {
    const nodeEditable = nodeId !== ROOT_ID;

    const menu = new Menu();
    menu.append(new MenuItem({label: 'Share link', icon: remote.nativeImage.createFromDataURL(require('../icon-share.png')), click() {
      copyStashLink(nodeId);
    }}));
    menu.append(new MenuItem({label: 'Permissions', icon: remote.nativeImage.createFromDataURL(require('../icon-users.png')), click() {
      dispatch(openPermissions(nodeId));
    }}));
    menu.append(new MenuItem({label: 'Show history', icon: remote.nativeImage.createFromDataURL(require('../icon-history.png')), click() {
      dispatch(openNodeHistory(nodeId));
    }}));
    if (nodeEditable) {
      menu.append(new MenuItem({type: 'separator'}));
      menu.append(new MenuItem({label: 'Delete', icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() {
        dispatch(prepareDeleteNode(nodeId));
      }}));
    }
    menu.popup({window: remote.getCurrentWindow()});
  };
}
