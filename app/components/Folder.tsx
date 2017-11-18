import * as React from 'react';
import * as cx from 'classnames';
import { EntryDropTarget } from './tools/EntryPtrDrag';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';
import EntryPtr from '../domain/EntryPtr';
import * as styles from './Folder.scss';

export interface Props {
  label: string,
  childIds: string[],
  expanded?: boolean,
  selected?: boolean,
  marked?: boolean,
  accessible?: boolean,
  authInfo?: string,
  onClickIcon: () => void,
  onClickLabel: () => void,
  onClickAuth: () => void,
  onCheckDropEntry: (ptr: EntryPtr) => boolean,
  onDropEntry: (ptr: EntryPtr) => void
}

export default ({ label, childIds, expanded, selected, marked, accessible, authInfo, onClickIcon, onClickLabel, onClickAuth, onCheckDropEntry, onDropEntry }: Props): any => {
  if (label) {
    return (
      <TreeNode
        label={<span>
            <EntryDropTarget
              className={cx(selected && styles.nameSelected, marked && styles.nameMarked)}
              acceptClassName={styles.nameDrop}
              onCheckDrop={onCheckDropEntry}
              onDrop={onDropEntry}
            >
              {label}
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
