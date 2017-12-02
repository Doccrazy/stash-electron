import * as React from 'react';

export default  ({ path }: { path: string[] }) => (<span className="text-primary" title={path.slice(1).join(' / ')}>
  {path[path.length - 1]}
</span>);
