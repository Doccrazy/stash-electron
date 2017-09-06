import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LinkWithIcon from '../components/LinkWithIcon';
import { selectSpecial } from '../actions/currentNode';
import specialFolders from '../utils/specialFolders';

export default connect((state, props) => ({
  active: state.currentNode.specialId === props.id,
  title: specialFolders[props.id].title,
  icon: specialFolders[props.id].icon
}), (dispatch, props) => ({
  onClick: () => dispatch(selectSpecial(props.id))
}))(LinkWithIcon);
