import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Folder from '../components/Folder';
import { select, toggle } from '../actions/repository';

export default connect((state, props) => ({
  node: state.repository.nodes[props.nodeId],
  expanded: state.repository.open.has(props.nodeId),
  selected: state.repository.selected === props.nodeId
}), (dispatch, props) => ({
   onClickIcon: () => dispatch(toggle(props.nodeId)),
   onClickLabel: () => dispatch(select(props.nodeId))
}))(Folder);
