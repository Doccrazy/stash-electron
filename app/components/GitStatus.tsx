import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import * as cx from 'classnames';
import * as styles from './GitStatus.css';
import { GitStatus } from '../actions/types/git';
import { formatStatusLine } from '../utils/git';

function color(status: GitStatus) {
  if (!status.initialized) {
    return 'text-secondary';
  }
  if (status.error || status.conflict) {
    return 'text-danger';
  }
  if (status.commitsAheadOrigin) {
    return 'text-warning';
  }
  return 'text-success';
}

export interface Props {
  status: GitStatus,
  working?: boolean,
  onClick: () => void
}

export default ({ status, working, onClick }: Props) => (<span>
  <a href="" id="gitStatusLink" onClick={onClick} className={cx(color(status), styles.container)}>
    <i className={cx('fa fa-git-square', styles.git, working && styles.working, status.commitsAheadOrigin && styles.attention)} />
    {status.conflict && <span className="text-danger">!</span>}
    {!!status.incomingCommits && <span><i className="fa fa-long-arrow-down" />{status.incomingCommits}</span>}
    {!!status.commitsAheadOrigin && <span><i className="fa fa-long-arrow-up" />{status.commitsAheadOrigin}</span>}
  </a>
  <UncontrolledTooltip placement={'bottom-end' as any} target="gitStatusLink">
    {!status.conflict && !status.error && status.upstreamName &&
      <span>{formatStatusLine(status.commitsAheadOrigin, status.upstreamName, true)}</span>
    }
    {status.incomingCommits && <span className="text-success">{status.incomingCommits} new commit(s) received on last pull.</span>}
    {!status.initialized && <span>No git repository found.</span>}
    {status.error && <span className="text-danger">Error: {status.error}.</span>}
    {status.conflict && <span className="text-danger">Conflicts need to be resolved.</span>}
    </UncontrolledTooltip>
</span>);
