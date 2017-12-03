import * as React from 'react';
import { toastr } from 'react-redux-toastr';
import Node, { ROOT_ID } from '../domain/Node';
import * as styles from './UserKeyTable.css';

export interface Props {
  users: string[],
  authorizationNodes: Node[],
  currentUser?: string | null
}

export default ({ users, authorizationNodes, currentUser }: Props) => (
  <table className={`table table-hover table-sm table-sticky ${styles.table} ${styles.accessTable}`}>
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
          const authorized = node.authorizedUsers && node.authorizedUsers.includes(username);
          return <td key={node.id} onClick={() => toastr.info('', 'sorry, not yet')}>
            {<i className={`fa fa-${authorized ? 'check' : 'times'} text-${authorized ? 'success' : 'danger'}`}/>}
          </td>;
        })}
      </tr>))}
    </tbody>
  </table>
);
