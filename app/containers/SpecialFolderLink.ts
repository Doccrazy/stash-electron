import { connect } from 'react-redux';
import LinkWithIcon from '../components/LinkWithIcon';
import { selectSpecial } from '../actions/currentNode';
import specialFolders, { SpecialFolderId } from '../utils/specialFolders';
import { Dispatch, RootState } from '../actions/types/index';

export interface Props {
  id: SpecialFolderId
}

export default connect((state: RootState, props: Props) => ({
  active: state.currentNode.specialId === props.id,
  title: specialFolders[props.id].title(state),
  icon: specialFolders[props.id].icon
}), (dispatch: Dispatch, props) => ({
  onClick: () => dispatch(selectSpecial(props.id))
}))(LinkWithIcon);
