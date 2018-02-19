import * as React from 'react';
import {State} from '../actions/types/keys';
import { KeyFormat } from '../actions/types/settings';
import * as styles from './UserKeyTable.css';

export interface Props {
  keysByUser: State['byUser'],
  currentUser?: string | null,
  keyFormat: KeyFormat,
  onToggleKeyFormat: () => void
  onDelete: (username: string) => void
}

export default ({ keysByUser, currentUser, keyFormat, onDelete, onToggleKeyFormat }: Props) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
    <thead>
      <tr>
        <th>Username</th>
        <th className="clickable" title="Toggle key display" onClick={onToggleKeyFormat}>Public key (SSH)</th>
        <th>Key name</th>
        <th />
      </tr>
    </thead>
    <tbody>
      {Object.keys(keysByUser).sort().map(username => (<tr key={username} className={username === currentUser ? 'table-success' : ''}>
        <td>{username}</td>
        <td className={styles.keyCell}>
          {keyFormat === KeyFormat.FULL
            ? keysByUser[username].toString('ssh').substr(8)
            : <span>
              {keysByUser[username].size} {keyFormat === KeyFormat.MD5 && 'MD5:'}{keysByUser[username].fingerprint(keyFormat).toString()}
            </span>}
        </td>
        <td>{keysByUser[username].comment}</td>
        <td>{currentUser && username !== currentUser && <a href="" className="text-danger" onClick={() => onDelete(username)}><i className="fa fa-trash-o"/></a>}</td>
      </tr>))}
    </tbody>
  </table>
);
