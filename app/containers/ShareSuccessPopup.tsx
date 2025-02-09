import { connect } from 'react-redux';
import { closeShare, copyPasteUrl } from '../actions/share';
import { Dispatch, RootState } from '../actions/types/index';
import ShareSuccessPopup from '../components/ShareSuccessPopup';

export default connect(
  (state: RootState) => ({
    open: !!state.share.sharing && !!state.share.pasteUrl,
    entry: state.share.sharing && state.share.sharing.entry,
    pasteUrl: state.share.pasteUrl || ''
  }),
  (dispatch: Dispatch) => ({
    onCopy: () => dispatch(copyPasteUrl()),
    onClose: () => dispatch(closeShare())
  })
)(ShareSuccessPopup);
