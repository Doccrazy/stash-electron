import React from 'react';
import Breadcrumb from './Breadcrumb';
import { hierarchy } from '../utils/repository';
import styles from './CurrentFolder.scss';
import TextEditBox from './TextEditBox';

export default ({ nodes, currentNodeId, editing, currentName, onSelectFolder, onChangeName, onCancelEdit, onConfirmEdit }) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  return (<div>
    {currentNodeId && !editing && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} />}
    {currentNodeId && editing && <TextEditBox value={currentName} onChange={onChangeName} onConfirm={onConfirmEdit} onCancel={onCancelEdit} />}
  </div>);
};
