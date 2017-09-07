import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Folder from '../components/Folder';
import { toggle } from '../actions/treeState';
import { select } from '../actions/currentNode';

export default connect((state, props) => ({
  node: state.repository.nodes[props.nodeId],
  expanded: state.treeState.has(props.nodeId),
  selected: !state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
  marked: state.currentNode.specialId && state.currentNode.nodeId === props.nodeId
}), (dispatch, props) => ({
   onClickIcon: () => dispatch(toggle(props.nodeId)),
   onClickLabel: () => dispatch(select(props.nodeId))
}))(Folder);
