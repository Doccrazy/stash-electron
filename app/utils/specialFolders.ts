import EntryPtr from '../domain/EntryPtr';
import { RootState } from '../actions/types/index';
import { t } from './i18n/redux';

export type SpecialFolderId = 'favorites' | 'searchResults';

export interface SpecialFolder {
  title: (state: RootState) => string;
  icon: string;
  selector: (state: RootState) => EntryPtr[];
}

const SPECIAL_FOLDERS: { [id in SpecialFolderId]: SpecialFolder } = {
  favorites: {
    title: () => t('common.specialFolder.favorites'),
    icon: 'star',
    selector: (state: RootState) => state.favorites.toArray()
  },
  searchResults: {
    title: (state: RootState) =>
      t('common.specialFolder.searchResults', { size: state.search.results.size > 100 ? '100+' : state.search.results.size }),
    icon: 'search',
    selector: (state: RootState) => state.search.results.toArray().slice(0, 100)
  }
};

export default SPECIAL_FOLDERS;
