import * as React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, Button, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledDropdown } from 'reactstrap';
import { AuthHistory } from '../actions/types/usersHistory';
import { formatDateTime, formatPathSpaced } from '../utils/format';
import Trans from '../utils/i18n/Trans';
import withTrans from '../utils/i18n/withTrans';
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

export default withTrans<Props>('component.authHistoryPopup')(({ t, open, nodePath, history, filterOptions, filterNodeId, onFilter, onClose }) => {
  return (<Modal size="lg" isOpen={open} toggle={onClose} returnFocusAfterClose={false}>
    <ModalHeader toggle={onClose}>{t('.title', { nodePath: nodePath ? formatPathSpaced(nodePath) : '_NONE' })}</ModalHeader>
    <ModalBody>
      {!nodePath && <UncontrolledDropdown tag="span" className={styles.filter}>
        {filterNodeId
          ? <a href="#" className="text-danger" title={t('common.filter.clear')}
               onClick={ev => { ev.preventDefault(); onFilter(); }}><i className="fa fa-filter"/></a>
          : <DropdownToggle nav className="text-dark" title={t('common.filter.set')}>
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
            {!nodePath && <th>{t('common.column.folder')}</th>}
            <th><Trans id=".column.users"
                       added={<span className={styles.added}><Trans id=".added"/></span>}
                       removed={<span className={styles.removed}><Trans id=".removed"/></span>}/></th>
            <th>{t('common.column.author')}</th>
            <th>{t('common.column.date')}</th>
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
            <td colSpan={4} align="center"><a href="" onClick={onLoadMore}>{t('common.loadMore', { remaining })}</a></td>
          </tr>} />
          </tbody>
        </table>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button autoFocus color="secondary" onClick={onClose}>{t('action.common.close')}</Button>
    </ModalFooter>
  </Modal>);
});
