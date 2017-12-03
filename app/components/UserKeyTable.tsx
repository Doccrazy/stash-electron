import * as React from 'react';
import {State} from '../actions/types/keys';
import * as styles from './UserKeyTable.css';

export interface Props {
  keysByUser: State['byUser'],
  currentUser?: string | null,
  onDelete: (username: string) => void
}

export default ({ keysByUser, currentUser, onDelete }: Props) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
    <thead>
      <tr>
        <th>Username</th>
        <th>Public key (SSH)</th>
        <th>Key name</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {Object.keys(keysByUser).sort().map(username => (<tr key={username} className={username === currentUser ? 'table-success' : ''}>
        <td>{username}</td>
        <td className={styles.keyCell}>{keysByUser[username].toString('ssh').substr(8)}</td>
        <td>{keysByUser[username].comment}</td>
        <td>{currentUser && username !== currentUser && <a href="" className="text-danger" onClick={() => onDelete(username)}><i className="fa fa-trash-o"/></a>}</td>
      </tr>))}
    </tbody>
  </table>
);
