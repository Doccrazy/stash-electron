import cx from 'classnames';
import * as React from 'react';
import { formatDateTime } from '../utils/format';
import { GitCommitInfo } from '../utils/git';
import * as styles from './GitActionsPopup.scss';
import ItemLimiter from './tools/ItemLimiter';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  commits: GitCommitInfo[];
  rowClass?: (commit: GitCommitInfo, idx: number) => string | null | undefined | false;
  rowAction?: (commit: GitCommitInfo, idx: number) => React.ReactNode | null | undefined;
}

export default withTrans<Props>('component.gitCommitsTable')(({ t, commits, rowClass, rowAction }) => {
  return (
    <table className="table table-sm table-sticky">
      <thead>
        <tr>
          <th>{t('.col.hash')}</th>
          <th>{t('.col.message')}</th>
          <th>{t('.col.author')}</th>
          <th>{t('.col.date')}</th>
          {rowAction && <th />}
        </tr>
      </thead>
      <tbody>
        <ItemLimiter
          items={commits}
          item={(commit, idx) => (
            <tr key={commit.hash} className={cx(styles.commitRow, commit.pushed && '', rowClass && rowClass(commit, idx))}>
              <td className="selectable">{commit.hash.substr(0, 7)}</td>
              <td className="selectable">
                {commit.remoteRef && <i className="fa fa-tag" title={commit.remoteRef} />}{' '}
                {!commit.pushed && <span className="badge badge-danger">{t('.new')}</span>} {commit.message}
              </td>
              <td className="selectable" title={`${commit.authorName} <${commit.authorEmail}>`}>
                {commit.authorName}
              </td>
              <td className="selectable text-nowrap">{formatDateTime(commit.date)}</td>
              {rowAction && <td>{rowAction(commit, idx)}</td>}
            </tr>
          )}
          loadMore={(onLoadMore, remaining) => (
            <tr key="_more">
              <td colSpan={rowAction ? 5 : 4} align="center">
                <a href="#" onClick={onLoadMore}>
                  {t('common.loadMore', { remaining })}
                </a>
              </td>
            </tr>
          )}
        />
      </tbody>
    </table>
  );
});
