import { remote } from 'electron';
import EntryPtr from '../domain/EntryPtr';
import { ROOT_ID } from '../domain/Node';
import { typeFor, WellKnownField } from '../fileType';
import PasswordType from '../fileType/password';
import { copyStashLink } from '../store/stashLinkHandler';
import { t } from '../utils/i18n/redux';
import { isAccessible } from '../utils/repository';
import { open as openPermissions } from './authorizedUsers';
import { copyToClipboard, prepareDelete as prepareDeleteEntry } from './currentEntry';
import { prepareDelete as prepareDeleteNode, startCreate } from './currentNode';
import { createInCurrent, open } from './edit';
import { browseForAdd } from './external';
import { open as openNodeHistory } from './nodeHistory';
import { Thunk } from './types';

const { Menu, MenuItem } = remote;

export function entryContextMenu(ptr: EntryPtr): Thunk<void> {
  return (dispatch, getState) => {
    const accessible = isAccessible(getState().repository.nodes, ptr.nodeId, getState().privateKey.username);

    const menu = new Menu();
    if (accessible) {
      menu.append(new MenuItem({
        label: t('action.common.edit'), accelerator: 'F2', icon: remote.nativeImage.createFromDataURL(require('../icon-pencil.png')), click() {
          dispatch(open(ptr));
        }
      }));
      if (typeFor(ptr.entry).readField) {
        menu.append(new MenuItem({
          label: t('fileType.password.contextMenu.copyUsername'),
          accelerator: 'Ctrl+B',
          icon: remote.nativeImage.createFromDataURL(require('../icon-user.png')),
          click() {
            dispatch(copyToClipboard(WellKnownField.USERNAME, ptr));
          }
        }));
        menu.append(new MenuItem({
          label: t('fileType.password.contextMenu.copyPassword'),
          accelerator: 'Ctrl+C',
          icon: remote.nativeImage.createFromDataURL(require('../icon-key.png')),
          click() {
            dispatch(copyToClipboard(WellKnownField.PASSWORD, ptr));
          }
        }));
      }
    }
    menu.append(new MenuItem({label: t('action.common.shareLink'), icon: remote.nativeImage.createFromDataURL(require('../icon-share.png')), click() {
      copyStashLink(ptr);
    }}));
    if (accessible) {
      menu.append(new MenuItem({type: 'separator'}));
      menu.append(new MenuItem({label: t('action.common.delete'), accelerator: 'Delete', icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() {
        dispatch(prepareDeleteEntry(ptr));
      }}));
    }
    menu.popup({window: remote.getCurrentWindow()});
  };
}

export function nodeContextMenu(currentNodeId?: string, fromFileList?: boolean): Thunk<void> {
  return (dispatch, getState) => {
    const nodeId = currentNodeId || (getState().currentNode.specialId ? undefined : getState().currentNode.nodeId);
    if (!nodeId) {
      return;
    }
    const nodeEditable = nodeId !== ROOT_ID;

    const menu = new Menu();
    if (fromFileList) {
      const accessible = isAccessible(getState().repository.nodes, nodeId, getState().privateKey.username);

      menu.append(new MenuItem({label: t('action.folder.create'), icon: remote.nativeImage.createFromDataURL(require('../icon-folder.png')), click() {
        dispatch(startCreate());
      }}));
      menu.append(new MenuItem({
        label: t('action.folder.createItem'),
        icon: remote.nativeImage.createFromDataURL(require('../icon-plus-circle.png')),
        click() {
          dispatch(createInCurrent(PasswordType.id));
        },
        enabled: accessible
      }));
      menu.append(new MenuItem({
        label: t('action.folder.addExternal'),
        icon: remote.nativeImage.createFromDataURL(require('../icon-file-o.png')),
        click() {
          dispatch(browseForAdd());
        },
        enabled: accessible
      }));
      menu.append(new MenuItem({type: 'separator'}));
    }
    menu.append(new MenuItem({label: t('action.common.shareLink'), icon: remote.nativeImage.createFromDataURL(require('../icon-share.png')), click() {
      copyStashLink(nodeId);
    }}));
    menu.append(new MenuItem({label: t('action.folder.permissions'), icon: remote.nativeImage.createFromDataURL(require('../icon-users.png')), click() {
      dispatch(openPermissions(nodeId));
    }}));
    menu.append(new MenuItem({label: t('action.common.history'), icon: remote.nativeImage.createFromDataURL(require('../icon-history.png')), click() {
      dispatch(openNodeHistory(nodeId));
    }}));
    if (nodeEditable && !fromFileList) {
      menu.append(new MenuItem({type: 'separator'}));
      menu.append(new MenuItem({label: t('action.common.delete'), icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() {
        dispatch(prepareDeleteNode(nodeId));
      }}));
    }
    menu.popup({window: remote.getCurrentWindow()});
  };
}
