import * as React from 'react';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';

export interface Props {
  node: { title: string, children: string[] },
  expanded: boolean,
  selected: boolean,
  marked: boolean,
  onClickIcon: () => void,
  onClickLabel: () => void
}

export default ({ node, expanded, selected, marked, onClickIcon, onClickLabel }: Props): any => {
  if (node && node.title) {
    return (
      <TreeNode label={node.title} canExpand={node.children && !!node.children.length} {...{ expanded, selected, marked, onClickIcon, onClickLabel }}>
        {expanded && node.children && node.children.map(childId => <ConnectedFolder key={childId} nodeId={childId} />)}
      </TreeNode>
    );
  }
  return <div />;
};
