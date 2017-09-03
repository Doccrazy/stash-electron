// @flow
import React, { Component } from 'react';
import { Col, Row } from 'reactstrap';
import FolderActionBar from '../containers/FolderActionBar';
import FileList from '../containers/FileList';
import Folder from '../containers/Folder';
import FileDetails from '../containers/FileDetails';
import EditPopup from '../containers/EditPopup';
import DeletePopup from '../containers/DeletePopup';
import DeleteNodePopup from '../containers/DeleteNodePopup';
import CurrentFolder from '../containers/CurrentFolder';
import styles from './Home.css';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.home}>
        <EditPopup />
        <DeletePopup />
        <DeleteNodePopup />
        <div className={`bg-light ${styles.sidebar}`}>
          <p>
            <a className="text-dark" href="#"><i className="fa fa-star" />&nbsp;My favorites</a>
          </p>
          <Folder nodeId="/" />
        </div>
        <div className={`${styles.main}`}>
          <div className={styles.contentHeader}>
            <Row>
              <Col>
                <CurrentFolder />
              </Col>
              <Col xs="auto" className="text-right">
                <FolderActionBar />
              </Col>
            </Row>
          </div>
          <div className={styles.contentBody}>
            <FileList />
          </div>
          <div className={styles.contentFooter}>
            <FileDetails />
          </div>
        </div>
      </div>
    );
  }
}
