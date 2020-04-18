import { connect } from 'react-redux';
import { changeSettings, close as closeImport, performExport } from '../actions/fileExport';
import ExportPopup from '../components/ExportPopup';
import { ExportSettings } from '../actions/types/fileExport';
import { Dispatch, RootState } from '../actions/types/index';

export default connect(
  (state: RootState) => ({
    open: state.fileExport.open,
    settings: state.fileExport.settings,
    status: state.fileExport.status,
    statusMessage: state.fileExport.statusMessage
  }),
  (dispatch: Dispatch) => ({
    onChangeSettings: (settings: ExportSettings) => dispatch(changeSettings(settings)),
    onExport: () => dispatch(performExport()),
    onClose: () => dispatch(closeImport())
  })
)(ExportPopup);
