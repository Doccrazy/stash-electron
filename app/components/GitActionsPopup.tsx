import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import cx from 'classnames';
import { GitStatus } from '../actions/types/git';
import * as styles from './GitActionsPopup.scss';
import { formatStatusLine } from '../utils/git';
import GitCommitsTable from './GitCommitsTable';
import withTrans from '../utils/i18n/withTrans';
import Trans from '../utils/i18n/Trans';

export interface Props {
  open?: boolean,
  disabled?: boolean,
  feedback?: string,
  status: GitStatus,
  markedForReset?: string,
  allowShowAll?: boolean
  onMarkReset: (commitHash?: string) => void
  onPushRevert: () => void
  onRefresh: () => void
  onResolve: () => void
  onClose: () => void
  onShowAll: () => void
}

function doFocus(ref: HTMLButtonElement) {
  if (ref) {
    setTimeout(() => ref.focus());
  }
}

export default withTrans<Props>('component.gitActionsPopup')(
  ({ t, open, disabled, feedback, status, markedForReset, allowShowAll,
     onMarkReset, onPushRevert, onRefresh, onResolve, onClose, onShowAll }) => {
  const toReset = status.commits ? status.commits.findIndex(ci => ci.hash === markedForReset) + 1 : 0;
  const toPush = status.commitsAheadOrigin ? status.commitsAheadOrigin - toReset : 0;
  const revertClick = (commitHash: string) => {
    if (!disabled) {
      onMarkReset(markedForReset === commitHash ? undefined : commitHash);
    }
  };

  return (<Modal size="lg" isOpen={open} toggle={() => { if (!status.conflict) { onClose(); } }} returnFocusAfterClose={false}>
    <ModalHeader toggle={() => { if (!status.conflict) { onClose(); } }}>{t('.title')}</ModalHeader>
    <ModalBody>
      {!status.conflict && !status.error && status.upstreamName && <p>{formatStatusLine(status.commitsAheadOrigin, status.upstreamName)}</p>}
      {status.incomingCommits && <p className="text-success">{t('common.git.newCommits', {incomingCommits: status.incomingCommits})}</p>}
      {status.error && <p className="text-danger">{t('common.git.error', {error: status.error})}</p>}
      {status.conflict && <div>
        <p className="text-danger">{t('.conflict.title')}</p>
        <p><Trans id="'.conflict.text'" markdown/></p>
      </div>}
      <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
        {status.commits && <GitCommitsTable commits={status.commits}
                                            rowClass={(commit, idx) => !commit.pushed && toReset > idx && 'table-danger'}
                                            rowAction={commit => !commit.pushed &&
                                              <a href="" onClick={() => revertClick(commit.hash)}  title={t('.action.selectRevert')}
                                                 className={cx('text-danger', styles.revert)}/>}/>}
      </div>
      {allowShowAll && <div><a href="" onClick={onShowAll}>{t('.action.showAll')}</a></div>}
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{flexGrow: 1}}>{feedback}</div>
      {(!!toPush || !!toReset) && <Button innerRef={doFocus} color={toPush ? 'success' : 'danger'} onClick={onPushRevert} disabled={disabled}>
        <i className={`fa fa-${toPush ? 'long-arrow-up' : 'undo'}`} />{' '}
        {!!toPush && !!toReset && t('.action.pushRevert', { toPush, toReset })}
        {!toReset && t('.action.push', { toPush })}
        {!toPush && t('.action.revert', { toReset })}
      </Button>}{' '}
      {status.conflict && <Button color="warning" onClick={onResolve} disabled={disabled}>{t('action.git.resolveTheirs')}</Button>}
      <Button color="info" onClick={onRefresh} disabled={disabled}><i className="fa fa-refresh" /> {t('action.git.pull')}</Button>{' '}
      {!status.conflict && <Button color="secondary" onClick={onClose} disabled={disabled}>{t('action.common.close')}</Button>}
    </ModalFooter>
  </Modal>);
});
