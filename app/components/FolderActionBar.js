import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import Breadcrumb from './Breadcrumb';
import BarsMenu from './BarsMenu';
import { hierarchy } from '../utils/repository';
import styles from './FolderActionBar.scss';

export default ({ nodes, currentNodeId, onSelectFolder, onRename, onDelete, onCreateNode, onCreateItem }) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  const editable = currentNodeId !== '/';
  return (<div>
    <Row>
      <Col>
        {currentNodeId && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} />}
      </Col>
      <Col xs="auto" className="text-right">
        <BarsMenu>
          <a className="dropdown-item" href="#"><i className="fa fa-user" /> Permissions</a>
          {editable && <a className="dropdown-item" href="#" onClick={() => onRename(currentNodeId)}><i className="fa fa-pencil" /> Rename folder</a>}
          {editable && <a className="dropdown-item" href="#" onClick={() => onDelete(currentNodeId)}><i className="fa fa-trash-o" /> Delete folder</a>}
        </BarsMenu>&nbsp;
        <Button onClick={() => onCreateNode(currentNodeId)}><i className="fa fa-folder" /> New folder</Button>&nbsp;
        <Button onClick={() => onCreateItem(currentNodeId)}><i className="fa fa-plus-circle" /> Create item</Button>
      </Col>
    </Row>
  </div>);
};
