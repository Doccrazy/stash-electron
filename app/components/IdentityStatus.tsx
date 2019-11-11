import * as React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap';
import * as cx from 'classnames';
import { KeyError } from '../actions/types/privateKey';
import { PrivateKeyInfo } from '../actions/types/settings';
import * as styles from './IdentityStatus.scss';
import withTrans from '../utils/i18n/withTrans';
import {BoundTranslate} from '../utils/i18n/Trans';

export interface Props {
  username?: string
  privateKeyPath?: string
  privateKeyBits?: number
  error?: KeyError
  lockAvailable?: boolean
  locked: boolean
  recentPrivateKeys: PrivateKeyInfo[]
  onLock: () => void
  onUnlock: () => void
  onLoad: (path: string) => void
  onBrowse: () => void
  onGenerate: () => void
}

function abbreviate(path: string) {
  return path && path.length > 28 ? '…' + path.substr(-28) : path;
}

const KeyInfo = ({t, username, privateKeyPath, privateKeyBits, locked}: Props & {t: BoundTranslate}) => <span>
  {username && <span>{username} {t('.keyInfo.from')}</span>}{' '}
  <span className="text-nowrap">{privateKeyPath ? abbreviate(privateKeyPath) : t('.keyInfo.noKey')}</span>{' '}
  {privateKeyBits && <span>({t('.keyInfo.bits', {bits: privateKeyBits})})</span>}{' '}
  {locked && <span>({t('.keyInfo.locked')})</span>}
</span>;

export default withTrans<Props>('component.identityStatus')(({t, ...props}) => <div className={styles.container}>
  <UncontrolledDropdown tag="span">
    <DropdownToggle tag="a" href="" className={cx(styles.link, props.username && styles.valid)} id="identityStatusLink"/>
    <DropdownMenu right>
      <DropdownItem header>
        <KeyInfo t={t} {...props}/>
      </DropdownItem>
      {props.privateKeyBits && !props.lockAvailable && <DropdownItem disabled>
        <i className="fa fa-warning text-warning" /> {t('.warning.notEncrypted')}
      </DropdownItem>}
      {props.lockAvailable && !props.locked && <DropdownItem onClick={props.onLock}><i className="fa fa-lock"/> {t('.action.lock')}</DropdownItem>}
      {props.locked && <DropdownItem onClick={props.onUnlock}><i className="fa fa-lock"/> {t('.action.unlock')}</DropdownItem>}
      <DropdownItem divider/>
      {props.recentPrivateKeys.map(keyInfo => <DropdownItem key={keyInfo.publicKey} onClick={() => props.onLoad(keyInfo.path)}>
        <i className="fa fa-sign-in"/> {abbreviate(keyInfo.path)}
      </DropdownItem>)}
      {props.recentPrivateKeys.length ? <DropdownItem divider/> : null}
      <DropdownItem onClick={props.onBrowse}><i className="fa fa-folder-open"/> {t('.action.loadKey')}&hellip;</DropdownItem>
      <DropdownItem onClick={props.onGenerate}><i className="fa fa-cog"/> {t('.action.generateKey')}&hellip;</DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
  {!props.username && !props.locked && <div className={props.privateKeyBits ? styles.warning : styles.error}/>}
  {props.locked && <a href="" className={styles.locked} title={t('.action.unlock')} onClick={props.onUnlock}/>}
  <UncontrolledTooltip placement="bottom-end" target="identityStatusLink">
    <KeyInfo t={t} {...props}/>{' '}
    {!props.username && !props.locked && props.privateKeyBits && <span>({t('.unauthorized')})</span>}{' '}
    {typeof props.error === 'number' && !props.locked && <span className="text-danger">({t(`.error.${KeyError[props.error]}`)})</span>}
  </UncontrolledTooltip>
</div>);
