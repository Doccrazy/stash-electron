import { connect } from 'react-redux';
import GenerateKeyPopup from '../components/GenerateKeyPopup';
import { changeGeneratePassphrase, closeGenerate, generateKeyAndPromptSave } from '../actions/privateKey';
import { Dispatch, RootState } from '../actions/types/index';

export default connect((state: RootState) => ({
  open: state.privateKey.generate.open,
  disabled: state.privateKey.generate.working,
  passphrase: state.privateKey.generate.passphrase,
  passphraseRepeat: state.privateKey.generate.repeatPassphrase,
  valid: (state.privateKey.generate.passphrase || '') === (state.privateKey.generate.repeatPassphrase || '')
}), (dispatch: Dispatch) => ({
  onChangePassphrase: (value: string) => dispatch(changeGeneratePassphrase(value)),
  onChangePassphraseRepeat: (value: string) => dispatch(changeGeneratePassphrase(value, true)),
  onGenerate: () => dispatch(generateKeyAndPromptSave()),
  onClose: () => dispatch(closeGenerate())
}))(GenerateKeyPopup);
