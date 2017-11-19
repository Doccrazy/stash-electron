import * as React from 'react';
import * as cx from 'classnames';
import * as styles from './GitStatus.css';

function color(init: boolean, error?: boolean, conflict?: boolean, ahead?: number) {
  if (!init) {
    return 'text-secondary';
  }
  if (error || conflict) {
    return 'text-danger';
  }
  if (ahead) {
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
  incoming?: number,
  onClick: () => void
}

export default ({ initialized = true, error, conflict, working, ahead, incoming, onClick }: Props) => (
  <a href="" onClick={onClick} className={cx(color(initialized, error, conflict, ahead), styles.container)}>
    <i className={cx('fa fa-git-square', styles.git, working && styles.working, ahead && styles.attention)} />
    {conflict && <span className="text-danger">!</span>}
    {!!incoming && <span><i className="fa fa-long-arrow-down" />{incoming}</span>}
    {!!ahead && <span><i className="fa fa-long-arrow-up" />{ahead}</span>}
  </a>
);
