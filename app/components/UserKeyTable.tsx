import * as React from 'react';
import { State } from '../actions/types/keys';
import { KeyFormat } from '../actions/types/settings';
import withTrans from '../utils/i18n/withTrans';
import styles from './UserKeyTable.css';

export interface Props {
  keysByUser: State['byUser'];
  currentUser?: string | null;
  keyFormat: KeyFormat;
  onToggleKeyFormat: () => void;
  onCopyKey: (username: string) => void;
  onDelete: (username: string) => void;
}

export default withTrans<Props>('component.userKeyTable')(
  ({ t, keysByUser, currentUser, keyFormat, onDelete, onToggleKeyFormat, onCopyKey }) => (
    <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
      <thead>
        <tr>
          <th>{t('common.column.username')}</th>
          <th className="clickable" title="Toggle key display" onClick={onToggleKeyFormat}>
            {t('.column.publicKey')}
          </th>
          <th>{t('.column.keyName')}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {Object.keys(keysByUser)
          .sort()
          .map((username) => (
            <tr key={username} className={username === currentUser ? 'table-success' : ''}>
              <td>{username}</td>
              <td className={`${styles.keyCell} clickable`} title={t('.action.copyPublicKey')} onClick={() => onCopyKey(username)}>
                {keyFormat === KeyFormat.FULL ? (
                  keysByUser[username].toString('ssh').substr(8)
                ) : (
                  <span>
                    {keysByUser[username].size} {keyFormat === KeyFormat.MD5 && 'MD5:'}
                    {keysByUser[username].fingerprint(keyFormat).toString()}
                  </span>
                )}
              </td>
              <td>{keysByUser[username].comment}</td>
              <td>
                {currentUser && username !== currentUser && (
                  <a href="" className="text-danger" onClick={() => onDelete(username)}>
                    <i className="fa fa-trash-o" />
                  </a>
                )}
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  )
);
