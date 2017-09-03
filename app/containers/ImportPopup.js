import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { changeSettings, close as closeImport, performImport } from '../actions/fileImport';
import ImportPopup from '../components/ImportPopup';

export default connect(state => ({
  open: state.fileImport.open,
  settings: state.fileImport.settings,
  status: state.fileImport.status,
  statusMessage: state.fileImport.statusMessage
}), dispatch => ({
  onChangeSettings: settings => dispatch(changeSettings(settings)),
  onImport: () => dispatch(performImport()),
  onClose: () => dispatch(closeImport())
}))(ImportPopup);
