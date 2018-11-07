import * as React from 'react';
import * as cx from 'classnames';
import * as jdenticon from 'jdenticon';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { SettingsMap } from '../actions/types/settings';
import * as styles from './RecentRepositories.scss';

export interface Props {
  repositories: SettingsMap['repositories'],
  repositoryPath?: string,
  loading?: boolean,
  onClick: (path: string) => void,
  onRemove: (path: string) => void,
  onBrowseLocal: () => void,
  onCloneRemote: () => void
}

const JDentIcon = ({ hash, className }: { hash: string, className?: string }) => {
  // @ts-ignore
  jdenticon.config = {};
  jdenticon.config.lightness = {
    color: [0.4, 0.8],
    grayscale: [0.2, 0.4]
  };
  jdenticon.config.saturation = {
    color: 0.8,
    grayscale: 0
  };
  return <div className={className} dangerouslySetInnerHTML={{__html: jdenticon.toSvg(hash, 128, 0)}}/>;
};

export default ({ repositories, repositoryPath, loading, onClick, onRemove, onBrowseLocal, onCloneRemote }: Props) => (<div className={styles.box}>
  {repositories.map(info =>
    <button key={info.path} disabled={info.path === repositoryPath || loading} onClick={() => onClick(info.path)} title={info.path}
            className={cx('btn', styles.repo, info.path === repositoryPath ? 'btn-info' : 'btn-outline-secondary',
              loading && info.path === repositoryPath && styles.loading)}>
      {!loading && info.path !== repositoryPath && <div onClick={ev => { onRemove(info.path); ev.stopPropagation(); }}
                                                        className={styles.remove} title="Remove from list"/>}
      <JDentIcon className={styles.icon} hash={info.id || info.path}/>
      <div className={styles.title}>{info.name}</div>
    </button>
  )}
  <UncontrolledDropdown tag="span">
    <DropdownToggle disabled={loading} className={cx(styles.repo, styles.add)} color="outline-secondary">
      <div className={styles.icon}/>
      <div className={styles.title}>Add...</div>
    </DropdownToggle>
    <DropdownMenu>
      <DropdownItem onClick={onBrowseLocal}><i className="fa fa-folder-open"/> Browse for local repository</DropdownItem>
      <DropdownItem onClick={onCloneRemote}><i className="fa fa-git-square"/> Clone remote repository</DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
  <small className="form-text text-muted selectable">{repositoryPath ? `Path: ${repositoryPath}` : <span>&nbsp;</span>}</small>
</div>);