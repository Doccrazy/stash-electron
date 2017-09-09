import { connect } from 'react-redux';
import SearchField from '../components/SearchField';
import { changeFilter, startSearch, toggleScope } from '../actions/search';

export default connect(state => ({
  value: state.search.filter,
  limitedScope: state.search.options.limitedScope
}), dispatch => ({
  onChange: (value: string) => dispatch(changeFilter(value)),
  onSearch: () => dispatch(startSearch()) as any,
  onToggleScope: () => dispatch(toggleScope()) as any
}))(SearchField);
