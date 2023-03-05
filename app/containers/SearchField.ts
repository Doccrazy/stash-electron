import { connect } from 'react-redux';
import SearchField from '../components/SearchField';
import { changeFilter, showResults } from '../actions/search';
import { Dispatch, RootState } from '../actions/types/index';

export default connect(
  (state: RootState) => ({
    value: state.search.filter
  }),
  (dispatch: Dispatch) => ({
    onChange: (value: string) => dispatch(changeFilter(value)),
    onShowResults: () => {
      dispatch(showResults());
    }
  })
)(SearchField);
