import { remote } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { ROOT_ID } from '../domain/Node';
import { copyStashLink } from '../store/stashLinkHandler';
import { isAccessible } from '../utils/repository';
import { open as openPermissions } from './authorizedUsers';
import { prepareDelete as prepareDeleteEntry } from './currentEntry';
import { prepareDelete as prepareDeleteNode } from './currentNode';
import { open } from './edit';
import { Thunk } from './types';

const { Menu, MenuItem } = remote;

export function entryContextMenu(ptr: EntryPtr): Thunk<void> {
  return (dispatch, getState) => {
    const accessible = isAccessible(getState().repository.nodes, ptr.nodeId, getState().privateKey.username);

    const menu = new Menu();
    if (accessible) {
      menu.append(new MenuItem({label: 'Edit', icon: remote.nativeImage.createFromDataURL(require('../icon-pencil.png')), click() {
        dispatch(open(ptr));
      }}));
    }
    menu.append(new MenuItem({label: 'Share link', icon: remote.nativeImage.createFromDataURL(require('../icon-share.png')), click() {
      copyStashLink(ptr);
    }}));
    if (accessible) {
      menu.append(new MenuItem({type: 'separator'}));
      menu.append(new MenuItem({label: 'Delete', icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() {
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
    menu.append(new MenuItem({label: 'Permissions', icon: remote.nativeImage.createFromDataURL(require('../icon-users.png')), click() {
      dispatch(openPermissions(nodeId));
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
