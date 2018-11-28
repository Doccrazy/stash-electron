import * as cx from 'classnames';
import * as React from 'react';
import { formatDateTime } from '../utils/format';
import { GitCommitInfo } from '../utils/git';
import * as styles from './GitActionsPopup.scss';
import ItemLimiter from './tools/ItemLimiter';

export interface Props {
  commits: GitCommitInfo[]
  upstreamName?: string
  rowClass?: (commit: GitCommitInfo, idx: number) => string | null | undefined | false
  rowAction?: (commit: GitCommitInfo, idx: number) => React.ReactNode | null | undefined
}

export default ({ commits, upstreamName, rowClass, rowAction }: Props) => {
  const upstreamRef = (commits.filter(ci => ci.pushed)[0] || {}).hash;

  return <table className="table table-sm table-sticky">
    <thead>
    <tr>
      <th>Hash</th>
      <th>Message</th>
      <th>Author</th>
      <th>Date</th>
      {rowAction && <th/>}
    </tr>
    </thead>
    <tbody>
    <ItemLimiter items={commits} item={(commit, idx) =>
      <tr key={commit.hash} className={cx(styles.commitRow, commit.pushed && '', rowClass && rowClass(commit, idx))}>
        <td className="selectable">{commit.hash.substr(0, 7)}</td>
        <td className="selectable">
          {commit.hash === upstreamRef && <i className="fa fa-tag" title={upstreamName || 'origin/master'} />}{' '}
          {!commit.pushed && <span className="badge badge-danger">new</span>}{' '}
          {commit.message}
        </td>
        <td className="selectable" title={`${commit.authorName} <${commit.authorEmail}>`}>{commit.authorName}</td>
        <td className="selectable text-nowrap">{formatDateTime(commit.date)}</td>
        {rowAction && <td>{rowAction(commit, idx)}</td>}
      </tr>} loadMore={(onLoadMore, remaining) => <tr key="_more">
      <td colSpan={rowAction ? 5 : 4} align="center"><a href="#" onClick={onLoadMore}>Show more ({remaining})</a></td>
    </tr>}/>
    </tbody>
  </table>;
};
