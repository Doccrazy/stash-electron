import * as React from 'react';
import { connect } from 'react-redux';
import ConfirmPopup from '../components/ConfirmPopup';
import {RootState} from '../actions/types/index';
import { changeSignature, confirmSignature } from '../actions/git';
import GitSignatureForm from '../components/GitSignatureForm';

const EMAIL_PATTERN = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

export default connect((state: RootState) => ({
  open: state.git.signature.open,
  name: state.git.signature.name,
  email: state.git.signature.email,
  local: state.git.signature.local,
  valid: !!state.git.signature.name && EMAIL_PATTERN.test(state.git.signature.email || '')
}), dispatch => ({
  onChange: (name: string, email: string, local: boolean) => dispatch(changeSignature(name, email, local)),
  onConfirm: () => dispatch(confirmSignature())
}))(
  ({ open, name, email, local, valid, onChange, onConfirm }) => (
    <ConfirmPopup open={open} valid={valid} title="Configure your git signature" onConfirm={onConfirm}>
      <GitSignatureForm name={name} email={email} local={local} onChange={onChange} />
    </ConfirmPopup>
  )
);
