import { connect } from 'react-redux';
import "redux-thunk";
import { addFiles } from '../actions/external';
import FileDropAcceptor from '../components/FileDropAcceptor';

export interface Props {
  children: any,
  [propName: string]: any;
}

export default connect(null, (dispatch, props: Props) => ({
  onDrop: (files: string[]) => dispatch(addFiles(files)) as any
}))(FileDropAcceptor);
