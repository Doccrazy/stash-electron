// @flow
import React from 'react';
import styles from './NoRepository.css';

export default ({ loading }) => (
  <div className={styles.main}>
    {loading ? <h1>Loading repository...</h1> : <h1>No repository loaded, check settings.</h1>}
  </div>
);
