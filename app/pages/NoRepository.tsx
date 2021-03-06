import * as React from 'react';
import Trans from '../utils/i18n/Trans';
import styles from './NoRepository.css';

export interface Props {
  loading: boolean;
}

const NoRepositoryPage = ({ loading }: Props) => (
  <div className={styles.main}>
    {loading ? (
      <h1>
        <Trans id="page.noRepository.loading" />
      </h1>
    ) : (
      <h1>
        <Trans id="page.noRepository.notLoaded" />
      </h1>
    )}
  </div>
);

export default NoRepositoryPage;
