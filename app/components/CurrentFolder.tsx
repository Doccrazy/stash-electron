import * as React from 'react';
import cx from 'classnames';
import withTrans from '../utils/i18n/withTrans';
import Breadcrumb from './Breadcrumb';
import { hierarchy } from '../utils/repository';
import * as styles from './CurrentFolder.scss';
import TextEditBox from './TextEditBox';
import Node from '../domain/Node';

interface SpecialDisplay {
  title: string,
  icon: string
}

export interface Props {
  nodes: {[nodeId: string]: Node},
  currentNodeId?: string,
  specialFolder?: SpecialDisplay,
  nodeEditable?: boolean,
  editing?: boolean,
  currentName?: string,
  onSelectFolder: (nodeId: string) => void,
  onRename?: () => void,
  onChangeName: (name: string) => void,
  onCancelEdit: () => void,
  onConfirmEdit: () => void
}

export default withTrans<Props>('component.currentFolder')(
  ({ t, nodes, currentNodeId, specialFolder, nodeEditable, editing, currentName, onSelectFolder, onRename, onChangeName, onCancelEdit, onConfirmEdit }) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  return (<div>
    {specialFolder && <Breadcrumb
      className={cx(styles.breadcrumb, `icon-${specialFolder.icon}`)}
      nodes={[{ id: 'special', name: specialFolder.title }]}
    />}
    {currentNodeId && !editing && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} editLink={nodeEditable ?
      <a href="" className="text-dark hover-content" title={t('action.folder.rename')} onClick={onRename}><i className="fa fa-pencil" /></a> : undefined} />}
    {currentNodeId && editing && <TextEditBox
      placeholder={t('.namePlaceholder')}
      value={currentName || ''}
      onChange={onChangeName}
      onConfirm={onConfirmEdit}
      onCancel={onCancelEdit}
    />}
  </div>);
});
