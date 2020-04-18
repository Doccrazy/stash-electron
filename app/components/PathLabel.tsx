import * as React from 'react';

const PathLabel = ({ path }: { path: string[] }) => (
  <span className="text-primary" title={path.slice(1).join(' / ')}>
    {path[path.length - 1]}
  </span>
);

export default PathLabel;
