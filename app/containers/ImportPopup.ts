import { connect } from 'react-redux';
import { changeSettings, close as closeImport, performImport } from '../actions/fileImport';
import ImportPopup from '../components/ImportPopup';
import {ImportSettings} from '../actions/types/fileImport';
import {RootState} from '../actions/types/index';

export default connect((state: RootState) => ({
  open: state.fileImport.open,
  settings: state.fileImport.settings,
  status: state.fileImport.status,
  statusMessage: state.fileImport.statusMessage
}), dispatch => ({
  onChangeSettings: (settings: ImportSettings) => dispatch(changeSettings(settings)),
  onImport: () => dispatch(performImport()),
  onClose: () => dispatch(closeImport())
}))(ImportPopup);
