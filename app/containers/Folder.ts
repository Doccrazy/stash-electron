import { connect } from 'react-redux';
import 'redux-thunk';
import Folder from '../components/Folder';
import { toggle } from '../actions/treeState';
import { select } from '../actions/currentNode';
import {RootState} from '../actions/types/index';

export interface Props {
  nodeId: string
}

export default connect((state: RootState, props: Props) => ({
  node: state.repository.nodes[props.nodeId],
  expanded: state.treeState.has(props.nodeId),
  selected: !state.currentNode.specialId && state.currentNode.nodeId === props.nodeId,
  marked: !!state.currentNode.specialId && state.currentNode.nodeId === props.nodeId
}), (dispatch, props) => ({
   onClickIcon: () => dispatch(toggle(props.nodeId)),
   onClickLabel: () => dispatch(select(props.nodeId))
}))(Folder);
