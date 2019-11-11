import * as React from 'react';
import cx from 'classnames';
import { EntryDropTarget } from './tools/EntryPtrDrag';
import { NodeDragSource, NodeDropTarget } from './tools/NodeDrag';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';
import EntryPtr from '../domain/EntryPtr';
import * as styles from './Folder.scss';

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
  onCheckDropEntry: (ptr: EntryPtr) => boolean,
  onDropEntry: (ptr: EntryPtr) => void,
  onCheckDropNode: (nodeId: string) => boolean,
  onDropNode: (nodeId: string) => void,
  onContextMenu: () => void
}

export default ({ nodeId, label, childIds, expanded, selected, marked, accessible, nodeEditable, authInfo,
                  onClickIcon, onClickLabel, onClickAuth, onCheckDropEntry, onDropEntry, onCheckDropNode, onDropNode, onContextMenu }: Props): any => {
  if (label) {
    return (
      <TreeNode
        label={<span onContextMenu={ev => { ev.preventDefault(); onContextMenu(); }}>
            <span className={cx(selected && styles.nameSelected, marked && styles.nameMarked)}>
              <EntryDropTarget acceptClassName={styles.nameDrop} onCheckDrop={onCheckDropEntry} onDrop={onDropEntry}>
                <NodeDragSource item={nodeId} dragAllowed={accessible && nodeEditable}>
                  <NodeDropTarget acceptClassName={styles.nameDrop} onCheckDrop={onCheckDropNode} onDrop={onDropNode}>
                    {label}
                  </NodeDropTarget>
                </NodeDragSource>
              </EntryDropTarget>
            </span>
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
