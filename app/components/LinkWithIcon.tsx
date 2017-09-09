import * as React from 'react';
import * as styles from './TreeNode.scss';

export interface Props {
  title: string,
  icon: string,
  active: boolean,
  onClick: () => void
}

export default ({ title, icon, active = false, onClick }: Props) => (
  <a className={`text-dark ${active ? styles.labelSelected : ''}`} href="#" onClick={onClick}><i className={`fa fa-${icon}`} />&nbsp;{title}</a>
);
