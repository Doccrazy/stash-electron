import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import * as cx from 'classnames';
import { GitStatus } from '../actions/types/git';
import * as styles from './GitActionsPopup.scss';
import { formatStatusLine } from '../utils/git';
import GitCommitsTable from './GitCommitsTable';

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

export default ({ open, disabled, feedback, status, markedForReset, allowShowAll,
                  onMarkReset, onPushRevert, onRefresh, onResolve, onClose, onShowAll }: Props) => {
  const toReset = status.commits ? status.commits.findIndex(ci => ci.hash === markedForReset) + 1 : 0;
  const toPush = status.commitsAheadOrigin ? status.commitsAheadOrigin - toReset : 0;
  const revertClick = (commitHash: string) => {
    if (!disabled) {
      onMarkReset(markedForReset === commitHash ? undefined : commitHash);
    }
  };

  return (<Modal size="lg" isOpen={open} toggle={() => { if (!status.conflict) { onClose(); } }}>
    <ModalHeader toggle={() => { if (!status.conflict) { onClose(); } }}>Git repository status</ModalHeader>
    <ModalBody>
      {!status.conflict && !status.error && status.upstreamName && <p>{formatStatusLine(status.commitsAheadOrigin, status.upstreamName)}</p>}
      {status.incomingCommits && <p className="text-success">{status.incomingCommits} new commit(s) received on last pull.</p>}
      {status.error && <p className="text-danger">Error: {status.error}.</p>}
      {status.conflict && <div>
        <p className="text-danger">Your repository is in a conflicting state, possibly because remote changes could not be automatically merged.</p>
        <p>
          Before working with the repository, the conflict has to be resolved. Please choose either <b>Resolve using 'theirs'</b> to
          accept the incoming change for all conflicting files (non-conflicting changes will be preserved), or <b>Pull &amp; refresh</b> if
          you resolved the conflict manually.
        </p>
      </div>}
      <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
        {status.commits && <GitCommitsTable commits={status.commits} upstreamName={status.upstreamName}
                                            rowClass={(commit, idx) => !commit.pushed && toReset > idx && 'table-danger'}
                                            rowAction={commit => !commit.pushed &&
                                              <a href="" onClick={() => revertClick(commit.hash)}  title="Select for revert"
                                                 className={cx('text-danger', styles.revert)}/>}/>}
      </div>
      {allowShowAll && <div><a href="" onClick={onShowAll}>Show all commits</a></div>}
    </ModalBody>
    <ModalFooter>
      <div className="text-danger" style={{flexGrow: 1}}>{feedback}</div>
      {(!!toPush || !!toReset) && <Button innerRef={doFocus} color={toPush ? 'success' : 'danger'} onClick={onPushRevert} disabled={disabled}>
        {!!toPush && <span><i className="fa fa-long-arrow-up" /> Push {toPush}</span>}
        {!toPush && !!toReset && <span><i className="fa fa-undo" /> Revert {toReset}</span>}
        {!!toPush && !!toReset && `, revert ${toReset}`} commit(s)
      </Button>}{' '}
      {status.conflict && <Button color="warning" onClick={onResolve} disabled={disabled}>Resolve using 'theirs'</Button>}
      <Button color="info" onClick={onRefresh} disabled={disabled}><i className="fa fa-refresh" /> Pull &amp; refresh</Button>{' '}
      {!status.conflict && <Button color="secondary" onClick={onClose} disabled={disabled}>Close</Button>}
    </ModalFooter>
  </Modal>);
};
