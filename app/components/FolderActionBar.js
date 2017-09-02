import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import Breadcrumb from './Breadcrumb';
import BarsMenu from './BarsMenu';
import { hierarchy } from '../utils/repository';
import styles from './FolderActionBar.scss';
import TextEditBox from './TextEditBox';

export default ({ nodes, currentNodeId, editing, currentName, onSelectFolder, onRename, onDelete, onCreateNode, onCreateItem, onChangeName, onCancelEdit, onConfirmEdit }) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  const editable = currentNodeId !== '/';
  return (<div>
    <Row>
      <Col>
        {currentNodeId && !editing && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} />}
        {currentNodeId && editing && <TextEditBox value={currentName} onChange={onChangeName} onConfirm={onConfirmEdit} onCancel={onCancelEdit} />}
      </Col>
      <Col xs="auto" className="text-right">
        <BarsMenu>
          <a className="dropdown-item" href="#"><i className="fa fa-user" /> Permissions</a>
          {editable && <a className="dropdown-item" href="#" onClick={onRename}><i className="fa fa-pencil" /> Rename folder</a>}
          {editable && <a className="dropdown-item" href="#" onClick={onDelete}><i className="fa fa-trash-o" /> Delete folder</a>}
        </BarsMenu>&nbsp;
        <Button onClick={onCreateNode}><i className="fa fa-folder" /> New folder</Button>&nbsp;
        <Button onClick={() => onCreateItem(currentNodeId)}><i className="fa fa-plus-circle" /> Create item</Button>
      </Col>
    </Row>
  </div>);
};
