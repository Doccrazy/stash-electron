import * as React from 'react';
import { formatPath } from '../utils/format';
import withTrans from '../utils/i18n/withTrans';
import * as styles from './UserKeyTable.css';

export interface PermissionMap {
  [username: string]: string[][];
}

export interface Props {
  permissionsByUser: PermissionMap;
  currentUser?: string | null;
}

export default withTrans<Props>('component.userPermissionTable')(({ t, permissionsByUser, currentUser }) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
    <thead>
      <tr>
        <th>{t('common.column.username')}</th>
        <th>{t('.column.folders')}</th>
      </tr>
    </thead>
    <tbody>
      {Object.keys(permissionsByUser)
        .sort()
        .map((username) => (
          <tr key={username} className={username === currentUser ? 'table-success' : ''}>
            <td>{username}</td>
            <td className="selectable">{permissionsByUser[username].map(formatPath).join(', ')}</td>
          </tr>
        ))}
    </tbody>
  </table>
));
