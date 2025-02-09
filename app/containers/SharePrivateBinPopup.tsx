import { connect } from 'react-redux';
import { changeShareSettings, closeShare, sharePrivateBin } from '../actions/share';
import { Dispatch, RootState } from '../actions/types/index';
import { ShareFormState } from '../actions/types/share';
import SharePrivateBinPopup from '../components/SharePrivateBinPopup';

export default connect(
  (state: RootState) => ({
    open: !!state.share.sharing && !state.share.pasteUrl,
    entry: state.share.sharing && state.share.sharing.entry,
    value: state.share.formState,
    privateBinSite: state.settings.current.privateBinSite
  }),
  (dispatch: Dispatch) => ({
    onChange: (value: ShareFormState) => dispatch(changeShareSettings(value)),
    onShare: () => dispatch(sharePrivateBin()),
    onClose: () => dispatch(closeShare())
  })
)(SharePrivateBinPopup);
