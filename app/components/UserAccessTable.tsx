import { Set } from 'immutable';
import * as React from 'react';
import cx from 'classnames';
import { AccessToggle } from '../actions/types/authorizedUsers';
import Node from '../domain/Node';
import Trans from '../utils/i18n/Trans';
import withTrans from '../utils/i18n/withTrans';
import * as styles from './UserAccessTable.scss';

export interface Props {
  users: string[],
  authorizationNodes: { node: Node, level: number, relevant: boolean }[],
  modifications: Set<AccessToggle>,
  currentUser?: string | null,
  onToggle: (node: Node, username: string) => void
}

export default withTrans<Props>()(({ users, authorizationNodes, modifications, currentUser, onToggle, t }) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
    <thead>
      <tr>
        <th className="sticky-y"><Trans id="common.column.folder"/></th>
        {users.map(username =>
          <th key={username} className={username === currentUser ? 'table-success' : ''}>{username}</th>
        )}
      </tr>
    </thead>
    <tbody>
      {authorizationNodes.map(auth => (<tr key={auth.node.id}>
        <th className={cx(!auth.relevant && 'text-muted')}>
          <span style={{ paddingLeft: `${auth.level * 0.6}rem` }}>{auth.node.name}</span>
        </th>
        {users.map(username => {
          const node = auth.node;
          let authorized = node.authorizedUsers && node.authorizedUsers.includes(username);
          const mayEdit = node.authorizedUsers && currentUser && currentUser !== username && node.authorizedUsers.includes(currentUser);
          const modified = modifications.find(m => m!.nodeId === node.id && m!.username === username);
          if (modified) {
            authorized = !authorized;
          }
          return <td key={username} onClick={() => { if (mayEdit) { onToggle(node, username); } }}
                     title={mayEdit ? t('action.folder.toggleAccess') : ''}
                     className={cx(auth.relevant && (authorized ? styles.authorized : styles.unauthorized),
                      mayEdit ? 'clickable' : styles.readonly, modified && styles.modified, username === currentUser && 'table-success')}/>;
        })}
      </tr>))}
    </tbody>
  </table>
));
