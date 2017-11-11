import * as React from 'react';
import * as cx from 'classnames';

export interface Props {
  lockAvailable?: boolean,
  locked?: boolean,
  onLock: () => void
  onUnlock: () => void
}

export default ({ lockAvailable, locked, onLock, onUnlock }: Props) => (
  lockAvailable ? <a
    href=""
    title={locked ? 'Unlock with your passphrase [Ctrl+L]' : 'Lock workspace [Ctrl+L]'}
    className={cx(locked && 'text-warning', 'mr-3')}
    onClick={() => locked ? onUnlock() : onLock()}
  >
    <i className={cx('fa', locked ? 'fa-lock' : 'fa-unlock')} />
  </a> : <span />
);
