import * as React from 'react';
import { Link } from 'react-router-dom';
import * as styles from './Changelog.scss';

const changelogHtml = require('../../CHANGELOG.md');

export default () => (
  <div className={`container ${styles.changelog}`}>
    <h1>
      <Link to="/settings" className="btn btn-secondary pull-right">Close</Link>
      Changelog
    </h1>
    <div className={styles.content}>
      <div dangerouslySetInnerHTML={{ __html: changelogHtml }} />
    </div>
  </div>
);
