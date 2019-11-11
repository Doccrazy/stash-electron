import { defaultTo } from 'lodash';
import { connect } from 'react-redux';
import { changeAndSave } from '../actions/settings';
import { Dispatch, RootState } from '../actions/types';
import LocaleChooser from '../components/LocaleChooser';
import { getLocales } from '../utils/i18n/message';

export default connect((state: RootState) => ({
  value: defaultTo(state.settings.edited.locale, ''),
  locales: getLocales()
}), (dispatch: Dispatch) => ({
  onChange: (locale: string) => {
    dispatch(changeAndSave('locale', locale));
  }
}))(LocaleChooser);
