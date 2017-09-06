// @flow
import React from 'react';
import styles from './TreeNode.scss';

type Props = {
  title: string,
  icon: string,
  active: boolean,
  onClick: () => void
};

export default ({ title, icon, active = false, onClick }: Props) => (
  <a className={`text-dark ${active ? styles.labelSelected : ''}`} href="#" onClick={onClick}><i className={`fa fa-${icon}`} />&nbsp;{title}</a>
);
