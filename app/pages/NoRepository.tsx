import * as React from 'react';
import * as styles from './NoRepository.css';

export interface Props {
  loading: boolean
}

export default ({ loading }: Props) => (
  <div className={styles.main}>
    {loading ? <h1>Loading repository...</h1> : <h1>No repository loaded, check settings.</h1>}
  </div>
);
