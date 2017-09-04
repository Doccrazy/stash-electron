import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { addFiles } from '../actions/external';
import FileDropAcceptor from '../components/FileDropAcceptor';

export default connect(null, dispatch => ({
  onDrop: files => dispatch(addFiles(files))
}))(FileDropAcceptor);
