import { connect } from 'react-redux';
import SearchField from '../components/SearchField';
import { changeFilter, startSearch, toggleScope, showResults } from '../actions/search';
import { Dispatch, RootState } from '../actions/types/index';

export default connect(
  (state: RootState) => ({
    value: state.search.filter,
    limitedScope: state.search.options.limitedScope
  }),
  (dispatch: Dispatch) => ({
    onChange: (value: string) => dispatch(changeFilter(value)),
    onSearch: () => dispatch(startSearch()) as any,
    onToggleScope: () => dispatch(toggleScope()) as any,
    onShowResults: () => {
      dispatch(showResults());
    }
  })
)(SearchField);
