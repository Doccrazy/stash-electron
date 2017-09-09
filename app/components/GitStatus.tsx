import * as React from 'react';
import * as cx from 'classnames';
import * as styles from './GitStatus.css';

function color(init: boolean, error?: boolean, ahead?: number, behind?: number) {
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

export interface Props {
  initialized?: boolean,
  error?: boolean,
  working?: boolean,
  ahead?: number,
  behind?: number
}

export default ({ initialized = true, error, working, ahead, behind }: Props) => (
  <span className={cx(color(initialized, error, ahead, behind), styles.container)}>
    <i className={cx('fa fa-git-square', styles.git, working && styles.working, behind && styles.attention)} />
    {behind && <span><i className="fa fa-long-arrow-down" />{behind}</span>}
    {ahead && <span><i className="fa fa-long-arrow-up" />{ahead}</span>}
  </span>
);
