import * as React from 'react';
import * as cx from 'classnames';
import * as styles from './TreeNode.scss';

export interface Props {
  label: string,
  children?: any,
  canExpand?: boolean,
  expanded?: boolean,
  selected?: boolean,
  marked?: boolean,
  accessible?: boolean,
  authInfo?: string,
  onClickIcon: () => void,
  onClickLabel: () => void,
  onClickAuth: () => void
}

export default ({ label, children, canExpand, expanded, selected, marked, accessible, authInfo, onClickIcon, onClickLabel, onClickAuth }: Props) => (<div>
  <a href="" className={cx(styles.label, selected && styles.labelSelected, marked && styles.labelMarked, !accessible && styles.labelInaccessible)} onClick={onClickLabel}>
    <span
      className={cx(styles.icon, canExpand && styles.iconWithChildren, expanded && styles.iconOpen)}
      onClick={ev => { ev.stopPropagation(); onClickIcon(); }}
    />
    <span className={styles.name}>
      {label}
    </span>
    <span
      className={cx(authInfo && styles.authIcon)}
      title={authInfo}
      onClick={ev => { if (ev.shiftKey) { ev.stopPropagation(); onClickAuth(); } }}
    />
  </a>
  <div className={cx(styles.children, expanded && styles.childrenOpen)}>
    {children}
  </div>
</div>);
