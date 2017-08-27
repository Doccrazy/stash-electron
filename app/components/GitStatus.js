import React from 'react';
import cx from 'classnames';
import styles from './GitStatus.css';

function color(init, error, ahead, behind) {
  if (error) {
    return 'text-danger';
  }
  if (!init) {
    return 'text-secondary';
  }
  if (ahead || behind) {
    return 'text-warning';
  }
  return 'text-success';
}

export default ({ initialized = true, error, working, ahead, behind}) => (
  <span className={cx(color(initialized, error, ahead, behind), styles.container)}>
    <i className={cx('fa fa-git-square', styles.git, working && styles.working, behind && styles.attention)} />
    {behind && <span><i className="fa fa-long-arrow-down" />{behind}</span>}
    {ahead && <span><i className="fa fa-long-arrow-up" />{ahead}</span>}
  </span>
);
