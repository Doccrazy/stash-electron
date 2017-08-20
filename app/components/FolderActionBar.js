import React from 'react';
import { Button, Row, Col } from 'reactstrap';
import Breadcrumb from './Breadcrumb';
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
        <Button><i className="fa fa-bars" /></Button>&nbsp;
        <Button><i className="fa fa-folder" /> New folder</Button>&nbsp;
        <Button><i className="fa fa-plus-circle" /> Create item</Button>
      </Col>
    </Row>
  </div>);
};
