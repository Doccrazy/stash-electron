// @flow
import React, { Component } from 'react';
import { Button, Row, Col } from 'reactstrap';
import FolderActionBar from '../containers/FolderActionBar';
import FileList from '../containers/FileList';
import Folder from '../containers/Folder';
import styles from './Home.css';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.home}>
        <div className={`bg-light ${styles.sidebar}`}>
          <p>
            <a className="text-dark" href="#"><i className="fa fa-star" />&nbsp;My favorites</a>
          </p>
          <Folder nodeId="/" />
        </div>
        <div className={`${styles.main}`}>
          <div className={styles.contentHeader}>
            <FolderActionBar />
          </div>
          <div className={styles.contentBody}>
            <FileList />
          </div>
          <div className={styles.contentFooter}>
            <Row>
              <Col>
                <h4><i className="fa fa-key" /> Some filename</h4>
              </Col>
              <Col xs="auto">
                <Button size="sm"><i className="fa fa-pencil" /></Button>&nbsp;
                <Button size="sm"><i className="fa fa-share" /></Button>&nbsp;
                <Button size="sm"><i className="fa fa-bars" /></Button>
              </Col>
            </Row>
            <Row>
              <div className="col-2"><strong>Description <i className="fa fa-copy" /></strong></div>
              <div className="col-10">Content Content Content Content Content</div>
              <div className="col-2"><strong>Username <i className="fa fa-copy" /></strong></div>
              <div className="col-4">root</div>
              <div className="col-2"><strong>URL <i className="fa fa-copy" /></strong></div>
              <div className="col-4"><a href="http://www.google.de">http://www.google.de <i className="fa fa-external-link" /></a></div>
              <div className="col-2"><strong>Password <i className="fa fa-copy" /></strong></div>
              <div className="col-4"><strong>●●●●●●●●</strong></div>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
