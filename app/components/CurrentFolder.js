import React from 'react';
import cx from 'classnames';
import Breadcrumb from './Breadcrumb';
import { hierarchy } from '../utils/repository';
import styles from './CurrentFolder.scss';
import TextEditBox from './TextEditBox';
import specialFolders from '../utils/specialFolders';

export default ({ nodes, currentNodeId, currentSpecialId, editing, currentName, onSelectFolder, onChangeName, onCancelEdit, onConfirmEdit }) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  return (<div>
    {currentSpecialId && <Breadcrumb
      className={cx(styles.breadcrumb, styles[`icon-${specialFolders[currentSpecialId].icon}`])}
      nodes={[{ id: currentSpecialId, title: specialFolders[currentSpecialId].title }]}
    />}
    {currentNodeId && !editing && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} />}
    {currentNodeId && editing && <TextEditBox value={currentName} onChange={onChangeName} onConfirm={onConfirmEdit} onCancel={onCancelEdit} />}
  </div>);
};
