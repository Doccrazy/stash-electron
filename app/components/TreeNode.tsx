import * as React from 'react';
import cx from 'classnames';
import * as styles from './TreeNode.scss';

export interface Props {
  label: React.ReactNode;
  children?: any;
  canExpand?: boolean;
  expanded?: boolean;
  accessible?: boolean;
  onClickIcon: () => void;
  onClickLabel: () => void;
  onShiftClick: () => void;
}

const TreeNode = ({ label, children, canExpand, expanded, accessible, onClickIcon, onClickLabel, onShiftClick }: Props) => (
  <div>
    <a
      href=""
      className={cx(styles.label, !accessible && styles.labelInaccessible)}
      onClick={(ev) => {
        if (ev.shiftKey) {
          onShiftClick();
        } else {
          onClickLabel();
        }
      }}
    >
      <span
        className={cx(styles.icon, canExpand && styles.iconWithChildren, expanded && styles.iconOpen)}
        onClick={(ev) => {
          ev.stopPropagation();
          onClickIcon();
        }}
      />
      {label}
    </a>
    <div className={cx(styles.children, expanded && styles.childrenOpen)}>{children}</div>
  </div>
);

export default TreeNode;
