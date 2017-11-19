import * as React from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import * as cx from 'classnames';
import { GitStatus } from '../actions/types/git';
import * as styles from './GitActionsPopup.scss';
import { formatStatusLine } from '../utils/git';

export interface Props {
  open?: boolean,
  disabled?: boolean,
  feedback?: string,
  status: GitStatus,
  markedForReset?: string,
  onMarkReset: (commitHash?: string) => void
  onPushRevert: () => void
  onRefresh: () => void
  onResolve: () => void
  onClose: () => void
}

function doFocus(ref: HTMLButtonElement) {
  if (ref) {
    setTimeout(() => ref.focus());
  }
}

const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: 'numeric' };

export default ({ open, disabled, feedback, status, markedForReset, onMarkReset, onPushRevert, onRefresh, onResolve, onClose }: Props) => {
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
      {status.error && <p className="text-danger">Error: {status.error}.</p>}
      {status.conflict && <div>
        <p className="text-danger">Your repository is in a conflicting state, possibly because remote changes could not be automatically merged.</p>
        <p>
          Before working with the repository, the conflict has to be resolved. Please choose either <b>Resolve using 'theirs'</b> to
          accept the incoming change for all conflicting files (non-conflicting changes will be preserved), or <b>Pull &amp; refresh</b> if
          you resolved the conflict manually.
        </p>
      </div>}
      {status.commits && <table className="table table-sm">
        <thead>
        <tr>
          <th>Hash</th>
          <th>Message</th>
          <th>Author</th>
          <th>Date</th>
          <th/>
        </tr>
        </thead>
        <tbody>
        {status.commits.map((commit, idx) =>
          <tr key={commit.hash} className={cx(styles.commitRow, commit.pushed && 'table-secondary', !commit.pushed && toReset > idx && 'table-danger')}>
            <td>{commit.hash.substr(0, 7)}</td>
            <td>{commit.pushed && <i className="fa fa-tag" title={status.upstreamName} />} {commit.message}</td>
            <td title={`${commit.authorName} <${commit.authorEmail}>`}>{commit.authorName}</td>
            <td className="text-nowrap">{commit.date.toLocaleString(undefined, DATE_FORMAT)}</td>
            <td>{!commit.pushed &&
              <a href="" onClick={() => revertClick(commit.hash)}  title="Select for revert" className={cx('text-danger', styles.revert)}/>
            }</td>
          </tr>
        )}
        </tbody>
      </table>}
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
