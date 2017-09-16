import * as React from 'react';
import naturalCompare from 'natural-compare';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';
import Node from '../domain/Node';

export interface Props {
  node: Node,
  expanded?: boolean,
  selected?: boolean,
  marked?: boolean,
  onClickIcon: () => void,
  onClickLabel: () => void
}

export default ({ node, expanded, selected, marked, onClickIcon, onClickLabel }: Props): any => {
  if (node && node.name) {
    return (
      <TreeNode label={node.name} canExpand={!!node.childIds.size} {...{ expanded, selected, marked, onClickIcon, onClickLabel }}>
        {expanded && node.childIds.sort((a, b) => naturalCompare(a.toLowerCase(), b.toLowerCase()))
          .map((childId: string) => <ConnectedFolder key={childId} nodeId={childId} />)
          .toArray()}
      </TreeNode>
    );
  }
  return <div />;
};
