import * as React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Button, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledDropdown } from 'reactstrap';
import { AuthHistory } from '../actions/types/usersHistory';
import { formatDateTime, formatPathSpaced } from '../utils/format';
import * as styles from './AuthHistoryPopup.scss';
import ItemLimiter from './tools/ItemLimiter';

export interface Props {
  open?: boolean,
  nodePath?: string[]
  history: AuthHistoryDTO[],
  filterOptions: { nodeId: string, title: string }[],
  filterNodeId?: string,
  onFilter: (nodeId?: string) => void,
  onClose: () => void
}

export interface AuthHistoryDTO extends AuthHistory {
  path: string[]
}

export default ({ open, nodePath, history, filterOptions, filterNodeId, onFilter, onClose }: Props) => {
  return (<Modal size="lg" isOpen={open} toggle={onClose}>
    <ModalHeader toggle={onClose}>Authorization history{nodePath && ` for ${formatPathSpaced(nodePath)}`}</ModalHeader>
    <ModalBody>
      {!nodePath && <UncontrolledDropdown tag="span" className={styles.filter}>
        {filterNodeId
          ? <a href="#" className="text-danger" title="Clear filter" onClick={ev => { ev.preventDefault(); onFilter(); }}><i className="fa fa-filter"/></a>
          : <DropdownToggle nav className="text-dark" title="Filter">
              <i className="fa fa-filter"/>
            </DropdownToggle>}
        <DropdownMenu>
          {filterOptions.map(o =>
            <DropdownItem key={o.nodeId} active={o.nodeId === filterNodeId} onClick={() => onFilter(o.nodeId)}>{o.title}</DropdownItem>
          )}
        </DropdownMenu>
      </UncontrolledDropdown>}
      <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
        <table className="table table-sm table-sticky">
          <thead>
          <tr>
            {!nodePath && <th>Folder</th>}
            <th>Users <span className={styles.added}>added</span>/<span className={styles.removed}>removed</span></th>
            <th>Author</th>
            <th>Date</th>
          </tr>
          </thead>
          <tbody>
          <ItemLimiter items={history} item={entry => <tr key={`${entry.hash}/${entry.nodeId}`}>
            {!nodePath && <td>{formatPathSpaced(entry.path)}</td>}
            <td>
              <ul className={styles.userList}>
              {entry.added.map(username => <li key={username} className={styles.added}>{username}</li>)}
              {entry.removed.map(username => <li key={username} className={styles.removed}>{username}</li>)}
              </ul>
            </td>
            <td title={entry.authorEmail}>{entry.authorName}</td>
            <td className="text-nowrap">{formatDateTime(entry.date)}</td>
          </tr>} loadMore={(onLoadMore, remaining) => <tr key="_more">
            <td colSpan={4} align="center"><a href="" onClick={ev => onLoadMore}>Show more ({remaining})</a></td>
          </tr>} />
          </tbody>
        </table>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button autoFocus color="secondary" onClick={onClose}>Close</Button>
    </ModalFooter>
  </Modal>);
};
