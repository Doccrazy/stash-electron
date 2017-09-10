import EntryPtr from '../domain/EntryPtr';
import {RootState} from '../actions/types/index';

export type SpecialFolderId = 'favorites' | 'searchResults';

export interface SpecialFolder {
  title: string,
  icon: string,
  selector: (state: RootState) => EntryPtr[]
}

const SPECIAL_FOLDERS: { [id in SpecialFolderId]: SpecialFolder } = {
  favorites: {
    title: 'My Favorites',
    icon: 'star',
    selector: (state: RootState) => state.favorites.toArray()
  },
  searchResults: {
    title: 'Search results',
    icon: 'search',
    selector: (state: RootState) => state.search.results.toArray()
  }
};

export default SPECIAL_FOLDERS;
