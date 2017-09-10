import EntryPtr from '../domain/EntryPtr';

export type SpecialFolderId = 'favorites' | 'searchResults';

interface SpecialFolder {
  title: string,
  icon: string,
  selector: (state: any) => EntryPtr[]
}

const SPECIAL_FOLDERS: { [id in SpecialFolderId]: SpecialFolder } = {
  favorites: {
    title: 'My Favorites',
    icon: 'star',
    selector: (state: any) => state.favorites.sortBy((ptr: EntryPtr) => ptr.entry).toArray()
  },
  searchResults: {
    title: 'Search results',
    icon: 'search',
    selector: (state: any) => state.search.results.sortBy((ptr: EntryPtr) => ptr.entry).toArray()
  }
};

export default SPECIAL_FOLDERS;
