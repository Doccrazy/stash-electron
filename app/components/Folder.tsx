import * as React from 'react';
import * as cx from 'classnames';
import { remote } from 'electron';
import { EntryDropTarget } from './tools/EntryPtrDrag';
import { NodeDragSource, NodeDropTarget } from './tools/NodeDrag';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';
import EntryPtr from '../domain/EntryPtr';
import * as styles from './Folder.scss';

const { Menu, MenuItem } = remote;

export interface Props {
  nodeId: string,
  label: string,
  childIds: string[],
  expanded?: boolean,
  selected?: boolean,
  marked?: boolean,
  accessible?: boolean,
  nodeEditable?: boolean,
  authInfo?: string,
  onClickIcon: () => void,
  onClickLabel: () => void,
  onClickAuth: () => void,
  onDelete: () => void,
  onCheckDropEntry: (ptr: EntryPtr) => boolean,
  onDropEntry: (ptr: EntryPtr) => void,
  onCheckDropNode: (nodeId: string) => boolean,
  onDropNode: (nodeId: string) => void
}

function showContextMenu(nodeEditable: boolean | undefined, onClickAuth: () => void, onDelete: () => void) {
  const menu = new Menu();
  menu.append(new MenuItem({label: 'Permissions', icon: remote.nativeImage.createFromDataURL(require('../icon-users.png')), click: onClickAuth}));
  if (nodeEditable) {
    menu.append(new MenuItem({type: 'separator'}));
    menu.append(new MenuItem({label: 'Delete', icon: remote.nativeImage.createFromDataURL(require('../icon-trash-o.png')), click() { onDelete(); }}));
  }
  menu.popup(remote.getCurrentWindow());
}

export default ({ nodeId, label, childIds, expanded, selected, marked, accessible, nodeEditable, authInfo,
                  onClickIcon, onClickLabel, onClickAuth, onDelete, onCheckDropEntry, onDropEntry, onCheckDropNode, onDropNode }: Props): any => {
  if (label) {
    return (
      <TreeNode
        label={<span onContextMenu={ev => { ev.preventDefault(); showContextMenu(nodeEditable, onClickAuth, onDelete); }}>
            <EntryDropTarget
              className={cx(selected && styles.nameSelected, marked && styles.nameMarked)}
              acceptClassName={styles.nameDrop}
              onCheckDrop={onCheckDropEntry}
              onDrop={onDropEntry}
            >
              <NodeDragSource item={nodeId} dragAllowed={accessible && nodeEditable}>
                <NodeDropTarget acceptClassName={styles.nameDrop} onCheckDrop={onCheckDropNode} onDrop={onDropNode}>
                  {label}
                </NodeDropTarget>
              </NodeDragSource>
            </EntryDropTarget>
            <span className={cx(authInfo && styles.authIcon)} title={authInfo}/>
          </span>}
        canExpand={!!childIds.length}
        {...{ expanded, accessible, onClickIcon, onClickLabel, onShiftClick: onClickAuth }}
      >
        {expanded && childIds.map((childId: string) => <ConnectedFolder key={childId} nodeId={childId} />)}
      </TreeNode>
    );
  }
  return <div />;
};
