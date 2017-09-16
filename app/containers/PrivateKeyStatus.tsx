import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';
import {KeyError} from '../actions/types/privateKey';
import {RootState} from '../actions/types/index';

export interface Props {
}

const ERRORS = {
  [KeyError.FILE]: 'File not found or file could not be opened.',
  [KeyError.ENCRYPTED]: 'Key is encrypted, but no passphrase was provided.',
  [KeyError.PASSPHRASE]: 'Invalid passphrase.',
  [KeyError.CANCELLED]: 'Cancelled by user.'
};

export default connect((state: RootState, props: Props) => ({
  error: state.privateKey.error,
  keySize: state.privateKey.key && state.privateKey.key.toPublic().size
}))(({ error, keySize }: { error: KeyError, keySize: number }) => (<span className={cx(typeof error === 'number' && 'text-danger', keySize && 'text-success')}>
  {typeof error === 'number' && ERRORS[error]}
  {keySize && `Valid key has been loaded, size = ${keySize} bits.`}
</span>));
