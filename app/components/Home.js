// @flow
import React, { Component } from 'react';
import FolderActionBar from '../containers/FolderActionBar';
import FileList from '../containers/FileList';
import Folder from '../containers/Folder';
import FileDetails from '../containers/FileDetails';
import EditPopup from '../containers/EditPopup';
import styles from './Home.css';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.home}>
        <EditPopup />
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
            <FileDetails />
          </div>
        </div>
      </div>
    );
  }
}
