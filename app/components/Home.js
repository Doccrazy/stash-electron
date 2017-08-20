// @flow
import React, { Component } from 'react';
import { Breadcrumb, BreadcrumbItem, Table, Button, Row, Col } from 'reactstrap';
import styles from './Home.css';
import utils from '../utils/styles.css';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.home}>
        <div className={`bg-light ${styles.sidebar}`}>
          <p>
            <a className="text-dark" href="#"><i className="fa fa-star" />&nbsp;My favorites</a>
          </p>
          <ul className="list-unstyled">
            {[...new Array(30)].map((e, i) =>
              <li key={i}><a className="text-dark" href="#"><i className="fa fa-folder" />&nbsp;Foo <i>({i})</i></a></li>
            )}
          </ul>
        </div>
        <div className={`${styles.main}`}>
          <div className={styles.contentHeader}>
            <Row>
              <Col>
                <Breadcrumb className={styles.breadcrumb}>
                  <BreadcrumbItem><a href="#">Home</a></BreadcrumbItem>
                  <BreadcrumbItem><a href="#">Library</a></BreadcrumbItem>
                  <BreadcrumbItem active>Data</BreadcrumbItem>
                </Breadcrumb>
              </Col>
              <Col xs="auto" className="text-right">
                <Button><i className="fa fa-bars" /></Button>&nbsp;
                <Button><i className="fa fa-folder" /> New folder</Button>&nbsp;
                <Button><i className="fa fa-plus-circle" /> Create item</Button>
              </Col>
            </Row>
          </div>
          <div className={styles.contentBody}>
            <Table hover className={`table-sm ${utils.stickyTable}`}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Fav</th>
                  <th>Filename</th>
                  <th className="text-right">Modified</th>
                </tr>
              </thead>
              <tbody>
                {[...new Array(20)].map((e, i) => (<tr key={i} className={utils.clickable}>
                  <td><i className="fa fa-star-o" /></td>
                  <td><i className="fa fa-key" /> Some filename</td>
                  <td className="text-right">{new Date().toLocaleString()}</td>
                </tr>))}
              </tbody>
            </Table>
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
              <div className="col-4"><a href="#">http://www.google.de <i className="fa fa-external-link" /></a></div>
              <div className="col-2"><strong>Password <i className="fa fa-copy" /></strong></div>
              <div className="col-4"><strong>●●●●●●●●</strong></div>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
