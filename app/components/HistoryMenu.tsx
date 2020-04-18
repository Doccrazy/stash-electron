import cx from 'classnames';
import * as React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { formatDate, formatDateTime } from '../utils/format';
import { GitCommitInfo } from '../utils/git';
import * as styles from './HistoryMenu.scss';
import withTrans from '../utils/i18n/withTrans';

export interface Props {
  history: GitCommitInfo[];
  selectedCommit?: string;
  onSelectHistory: (oid?: string) => void;
}

function commitDate(history: GitCommitInfo[], selectedCommit?: string) {
  if (selectedCommit) {
    const commit = history.find((ci) => ci.hash === selectedCommit);
    if (commit) {
      return formatDate(commit.date);
    }
  }
  return '';
}

function commitAuthor(history: GitCommitInfo[], selectedCommit?: string) {
  if (selectedCommit) {
    const commit = history.find((ci) => ci.hash === selectedCommit);
    if (commit) {
      return commit.authorName;
    }
  }
  return '';
}

export default withTrans<Props>('component.historyMenu')(({ t, history, selectedCommit, onSelectHistory }) => (
  <UncontrolledDropdown tag="span">
    <DropdownToggle
      size="sm"
      color={selectedCommit ? 'primary' : 'secondary'}
      title={
        selectedCommit
          ? t('.titleWithCommit', { hash: selectedCommit.substr(0, 7), author: commitAuthor(history, selectedCommit) })
          : t('.title')
      }
      onContextMenu={(ev) => {
        if (selectedCommit) {
          ev.preventDefault();
          onSelectHistory();
        }
      }}
    >
      <i className="fa fa-history" /> {commitDate(history, selectedCommit)}
    </DropdownToggle>
    <DropdownMenu right className={styles.dropdown}>
      {history.map((commit, idx) => (
        <DropdownItem
          key={commit.hash}
          active={selectedCommit ? commit.hash === selectedCommit : idx === 0}
          className={cx(styles.commit, idx === 0 && styles.latest)}
          onClick={() => onSelectHistory(idx === 0 ? undefined : commit.hash)}
        >
          <div>{commit.authorName}</div>
          <div>{formatDateTime(commit.date)}</div>
        </DropdownItem>
      ))}
    </DropdownMenu>
  </UncontrolledDropdown>
));
