import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SearchField from '../components/SearchField';
import { changeFilter, startSearch, toggleScope } from '../actions/search';

export default connect(state => ({
  value: state.search.filter,
  limitedScope: state.search.options.limitedScope
}), dispatch => ({
  onChange: value => dispatch(changeFilter(value)),
  onSearch: () => dispatch(startSearch()),
  onToggleScope: () => dispatch(toggleScope())
}))(SearchField);
