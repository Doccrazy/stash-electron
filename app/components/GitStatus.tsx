import * as React from 'react';
import * as cx from 'classnames';
import * as styles from './GitStatus.css';

function color(init: boolean, error?: boolean, conflict?: boolean, ahead?: number, behind?: number) {
  if (!init) {
    return 'text-secondary';
  }
  if (error || conflict) {
    return 'text-danger';
  }
  if (ahead || behind) {
    return 'text-warning';
  }
  return 'text-success';
}

export interface Props {
  initialized?: boolean,
  error?: boolean,
  conflict?: boolean,
  working?: boolean,
  ahead?: number,
  behind?: number,
  onClick: () => void
}

export default ({ initialized = true, error, conflict, working, ahead, behind, onClick }: Props) => (
  <a href="" onClick={onClick} className={cx(color(initialized, error, conflict, ahead, behind), styles.container)}>
    <i className={cx('fa fa-git-square', styles.git, working && styles.working, ahead && styles.attention)} />
    {conflict && <span className="text-danger">!</span>}
    {!!behind && <span><i className="fa fa-long-arrow-down" />{behind}</span>}
    {!!ahead && <span><i className="fa fa-long-arrow-up" />{ahead}</span>}
  </a>
);
