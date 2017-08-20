import React from 'react';
import styles from './TreeNode.scss';

export default ({ label, children, expanded, selected, onClickIcon, onClickLabel }) => (<div>
  <a className={`text-dark ${styles.label} ${expanded && styles.labelOpen} ${selected && styles.labelSelected}`} href onClick={onClickLabel}>
    <span
      className={`text-dark ${styles.icon} ${children && children.length && styles.iconWithChildren} ${expanded && styles.iconOpen} ${selected && styles.iconSelected}`}
      onClick={ev => { ev.stopPropagation(); onClickIcon(); }}
    />
    {label}
  </a>
  <div className={`${styles.children} ${expanded && styles.childrenOpen}`}>
    {children}
  </div>
</div>);
