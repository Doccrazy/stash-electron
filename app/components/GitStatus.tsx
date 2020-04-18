import * as React from 'react';
import { UncontrolledTooltip } from 'reactstrap';
import cx from 'classnames';
import * as styles from './GitStatus.css';
import { GitStatus } from '../actions/types/git';
import { formatStatusLine } from '../utils/git';
import withTrans from '../utils/i18n/withTrans';

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
  status: GitStatus;
  working?: boolean;
  onClick: () => void;
}

export default withTrans<Props>()(({ t, status, working, onClick }) => (
  <span>
    <a href="" id="gitStatusLink" onClick={onClick} className={cx(color(status), styles.container)}>
      <i className={cx('fa fa-git-square', styles.git, working && styles.working, status.commitsAheadOrigin && styles.attention)} />
      {status.conflict && <span className="text-danger">!</span>}
      {!!status.incomingCommits && (
        <span>
          <i className="fa fa-long-arrow-down" />
          {status.incomingCommits}
        </span>
      )}
      {!!status.commitsAheadOrigin && (
        <span>
          <i className="fa fa-long-arrow-up" />
          {status.commitsAheadOrigin}
        </span>
      )}
    </a>
    <UncontrolledTooltip placement={'bottom-end' as any} target="gitStatusLink">
      {!status.conflict && !status.error && status.upstreamName && (
        <div>{formatStatusLine(status.commitsAheadOrigin, status.upstreamName, true)}</div>
      )}
      {status.incomingCommits && (
        <div className="text-success">{t('common.git.newCommits', { incomingCommits: status.incomingCommits })}</div>
      )}
      {!status.initialized && <div>{t('common.git.noRepository')}</div>}
      {status.error && <div className="text-danger">{t('common.git.error', { error: status.error })}</div>}
      {status.conflict && <div className="text-danger">{t('common.git.conflict')}</div>}
    </UncontrolledTooltip>
  </span>
));
