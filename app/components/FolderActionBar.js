import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import Breadcrumb from './Breadcrumb';
import BarsMenu from './BarsMenu';
import { hierarchy } from '../utils/repository';
import styles from './FolderActionBar.css';

export default ({ nodes, currentNodeId, onSelectFolder }) => {
  const nodeHierarchy = hierarchy(nodes, currentNodeId);
  return (<div>
    <Row>
      <Col>
        {currentNodeId && <Breadcrumb className={styles.breadcrumb} nodes={nodeHierarchy} onClick={onSelectFolder} />}
      </Col>
      <Col xs="auto" className="text-right">
        <BarsMenu>
          <a className="dropdown-item" href="#"><i className="fa fa-user" /> Permissions</a>
          <a className="dropdown-item" href="#"><i className="fa fa-pencil" /> Rename folder</a>
          <a className="dropdown-item" href="#"><i className="fa fa-trash-o" /> Delete folder</a>
        </BarsMenu>&nbsp;
        <Button><i className="fa fa-folder" /> New folder</Button>&nbsp;
        <Button><i className="fa fa-plus-circle" /> Create item</Button>
      </Col>
    </Row>
  </div>);
};
