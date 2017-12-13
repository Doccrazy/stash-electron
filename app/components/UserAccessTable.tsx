import { Set } from 'immutable';
import * as React from 'react';
import * as cx from 'classnames';
import { AccessToggle } from '../actions/types/authorizedUsers';
import Node, { ROOT_ID } from '../domain/Node';
import * as styles from './UserAccessTable.scss';

export interface Props {
  users: string[],
  authorizationNodes: Node[],
  modifications: Set<AccessToggle>,
  currentUser?: string | null,
  onToggle: (node: Node, username: string) => void
}

export default ({ users, authorizationNodes, modifications, currentUser, onToggle }: Props) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table}`}>
    <thead>
      <tr>
        <th className="sticky-y">Username</th>
        {authorizationNodes.map(node =>
          <th key={node.id}>{node.id === ROOT_ID ? '/' : node.name}</th>
        )}
      </tr>
    </thead>
    <tbody>
      {users.sort().map(username => (<tr key={username} className={username === currentUser ? 'table-success' : ''}>
        <th>{username}</th>
        {authorizationNodes.map(node => {
          let authorized = node.authorizedUsers && node.authorizedUsers.includes(username);
          const mayEdit = node.authorizedUsers && currentUser && currentUser !== username && node.authorizedUsers.includes(currentUser);
          const modified = modifications.find(m => m!.nodeId === node.id && m!.username === username);
          if (modified) {
            authorized = !authorized;
          }
          return <td key={node.id} onClick={() => { if (mayEdit) { onToggle(node, username); } }}
                     title={mayEdit ? 'Toggle access' : ''} className={cx(authorized ? styles.authorized : styles.unauthorized,
                      mayEdit ? 'clickable' : styles.readonly, modified && styles.modified)}/>;
        })}
      </tr>))}
    </tbody>
  </table>
);
