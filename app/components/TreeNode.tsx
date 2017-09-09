import * as React from 'react';
import * as styles from './TreeNode.scss';

export interface Props {
  label: string,
  children?: any,
  canExpand: boolean,
  expanded: boolean,
  selected: boolean,
  marked: boolean,
  onClickIcon: () => void,
  onClickLabel: () => void
}

export default ({ label, children, canExpand, expanded, selected, marked, onClickIcon, onClickLabel }: Props) => (<div>
  <a className={`text-dark ${styles.label} ${selected && styles.labelSelected} ${marked && styles.labelMarked}`} href="" onClick={onClickLabel}>
    <span
      className={`text-dark ${styles.icon} ${canExpand && styles.iconWithChildren} ${expanded && styles.iconOpen}`}
      onClick={ev => { ev.stopPropagation(); onClickIcon(); }}
    />
    {label}
  </a>
  <div className={`${styles.children} ${expanded && styles.childrenOpen}`}>
    {children}
  </div>
</div>);
