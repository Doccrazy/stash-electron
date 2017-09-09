import * as React from 'react';
import * as cx from 'classnames';
import Breadcrumb from './Breadcrumb';
import { hierarchy } from '../utils/repository';
import * as styles from './CurrentFolder.scss';
import TextEditBox from './TextEditBox';
import specialFolders from '../utils/specialFolders';

export interface Props {
  nodes: {[nodeId: string]: any},
  currentNodeId: string,
  currentSpecialId?: string,
  editing: boolean,
  currentName: string,
  onSelectFolder: () => void,
  onChangeName: (name: string) => void,
  onCancelEdit: () => void,
  onConfirmEdit: () => void
}

export default ({ nodes, currentNodeId, currentSpecialId, editing, currentName, onSelectFolder, onChangeName, onCancelEdit, onConfirmEdit }: Props) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  return (<div>
    {currentSpecialId && <Breadcrumb
      className={cx(styles.breadcrumb, `icon-${specialFolders[currentSpecialId].icon}`)}
      nodes={[{ id: currentSpecialId, title: specialFolders[currentSpecialId].title }]}
    />}
    {currentNodeId && !editing && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} />}
    {currentNodeId && editing && <TextEditBox value={currentName} onChange={onChangeName} onConfirm={onConfirmEdit} onCancel={onCancelEdit} />}
  </div>);
};
