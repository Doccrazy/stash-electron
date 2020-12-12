import * as React from 'react';
import { Link } from 'react-router-dom';
import Trans from '../utils/i18n/Trans';
import styles from './Changelog.scss';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const changelogHtml = require('../../CHANGELOG.md');

const ChangelogPage = () => (
  <div className={`container ${styles.changelog}`}>
    <h1>
      <Link to="/settings" className="btn btn-secondary pull-right">
        <Trans id="action.common.close" />
      </Link>
      <Trans id="page.changelog.title" />
    </h1>
    <div className={styles.content}>
      <div dangerouslySetInnerHTML={{ __html: changelogHtml }} />
    </div>
  </div>
);

export default ChangelogPage;
