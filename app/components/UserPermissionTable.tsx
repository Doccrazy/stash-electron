import * as React from 'react';
import * as styles from './UserKeyTable.css';

export interface PermissionMap  {
  [username: string]: string[][]
}

export interface Props {
  permissionsByUser: PermissionMap,
  currentUser?: string | null
}

function formatPath(path: string[]): string {
  return path.length === 1 ? '/' : path.slice(1).slice(-2).join('/');
}

export default ({ permissionsByUser, currentUser }: Props) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
    <thead>
      <tr>
        <th>Username</th>
        <th>Authorized folders</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(permissionsByUser).sort().map(username => (<tr key={username} className={username === currentUser ? 'table-success' : ''}>
        <td>{username}</td>
        <td className="selectable">{permissionsByUser[username].map(formatPath).join(', ')}</td>
      </tr>))}
    </tbody>
  </table>
);
