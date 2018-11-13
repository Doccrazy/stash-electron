import * as React from 'react';
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap';
import * as cx from 'classnames';
import { KeyError } from '../actions/types/privateKey';
import { PrivateKeyInfo } from '../actions/types/settings';
import * as styles from './IdentityStatus.scss';

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

const KeyInfo = (props: Props) => <span>
  {props.username && <span>{props.username} from</span>}{' '}
  <span className="text-nowrap">{props.privateKeyPath ? abbreviate(props.privateKeyPath) : 'no private key loaded'}</span>{' '}
  {props.privateKeyBits && <span>({props.privateKeyBits} bits)</span>}{' '}
  {props.locked && <span>(locked)</span>}
</span>;

const ERRORS = {
  [KeyError.FILE]: 'File not found or file could not be opened.',
  [KeyError.ENCRYPTED]: 'Key is encrypted, but no passphrase was provided.',
  [KeyError.PASSPHRASE]: 'Invalid passphrase.',
  [KeyError.CANCELLED]: 'Cancelled by user.'
};

export default (props: Props) => <div className={styles.container}>
  <UncontrolledDropdown tag="span">
    <DropdownToggle tag="a" href="" className={cx(styles.link, props.username && styles.valid)} id="identityStatusLink"/>
    <DropdownMenu right>
      <DropdownItem header>
        <KeyInfo {...props}/>
      </DropdownItem>
      {props.privateKeyBits && !props.lockAvailable && <DropdownItem disabled>
        <i className="fa fa-warning text-warning" /> Key is not encrypted; workspace locking unavailable
      </DropdownItem>}
      {props.lockAvailable && !props.locked && <DropdownItem onClick={props.onLock}><i className="fa fa-lock"/> Lock workspace [Ctrl+L]</DropdownItem>}
      {props.locked && <DropdownItem onClick={props.onUnlock}><i className="fa fa-lock"/> Unlock with your passphrase [Ctrl+L]</DropdownItem>}
      <DropdownItem divider/>
      {props.recentPrivateKeys.map(keyInfo => <DropdownItem key={keyInfo.publicKey} onClick={() => props.onLoad(keyInfo.path)}>
        <i className="fa fa-sign-in"/> {abbreviate(keyInfo.path)}
      </DropdownItem>)}
      {props.recentPrivateKeys.length ? <DropdownItem divider/> : null}
      <DropdownItem onClick={props.onBrowse}><i className="fa fa-folder-open"/> Load key from file (SSH/PEM/PPK)&hellip;</DropdownItem>
      <DropdownItem onClick={props.onGenerate}><i className="fa fa-cog"/> Generate new keypair&hellip;</DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>
  {!props.username && !props.locked && <div className={props.privateKeyBits ? styles.warning : styles.error}/>}
  {props.locked && <a href="" className={styles.locked} title="Unlock with your passphrase [Ctrl+L]" onClick={props.onUnlock}/>}
  <UncontrolledTooltip placement="bottom-end" target="identityStatusLink">
    <KeyInfo {...props}/>{' '}
    {!props.username && !props.locked && props.privateKeyBits && <span>(unauthorized)</span>}{' '}
    {typeof props.error === 'number' && !props.locked && <span className="text-danger">({ERRORS[props.error]})</span>}
  </UncontrolledTooltip>
</div>;
