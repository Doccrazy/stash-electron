import { connect } from 'react-redux';
import LinkWithIcon from '../components/LinkWithIcon';
import { selectSpecial } from '../actions/currentNode';
import specialFolders, { SpecialFolderId } from '../utils/specialFolders';

export interface Props {
  id: SpecialFolderId
}

export default connect((state, props: Props) => ({
  active: state.currentNode.specialId === props.id,
  title: specialFolders[props.id].title,
  icon: specialFolders[props.id].icon
}), (dispatch, props) => ({
  onClick: () => dispatch(selectSpecial(props.id))
}))(LinkWithIcon);
