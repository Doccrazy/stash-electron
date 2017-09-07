import React from 'react';
import TreeNode from './TreeNode';
import ConnectedFolder from '../containers/Folder';

export default ({ node, expanded, selected, marked, onClickIcon, onClickLabel }) => {
  if (node && node.title) {
    return (
      <TreeNode label={node.title} {...{ expanded, selected, marked, onClickIcon, onClickLabel }}>
        {node.children && node.children.map(childId => <ConnectedFolder key={childId} nodeId={childId} />)}
      </TreeNode>
    );
  }
  return <div />;
};
