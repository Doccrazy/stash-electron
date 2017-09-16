import * as React from 'react';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';

export interface Props {
  label: string,
  childIds: string[],
  expanded?: boolean,
  selected?: boolean,
  marked?: boolean,
  onClickIcon: () => void,
  onClickLabel: () => void
}

export default ({ label, childIds, expanded, selected, marked, onClickIcon, onClickLabel }: Props): any => {
  if (label) {
    return (
      <TreeNode label={label} canExpand={!!childIds.length} {...{ expanded, selected, marked, onClickIcon, onClickLabel }}>
        {expanded && childIds.map((childId: string) => <ConnectedFolder key={childId} nodeId={childId} />)}
      </TreeNode>
    );
  }
  return <div />;
};
