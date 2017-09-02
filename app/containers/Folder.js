import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Folder from '../components/Folder';
import { toggle } from '../actions/repository';
import { select } from '../actions/currentNode';

export default connect((state, props) => ({
  node: state.repository.nodes[props.nodeId],
  expanded: state.repository.open.has(props.nodeId),
  selected: state.currentNode.nodeId === props.nodeId
}), (dispatch, props) => ({
   onClickIcon: () => dispatch(toggle(props.nodeId)),
   onClickLabel: () => dispatch(select(props.nodeId))
}))(Folder);
