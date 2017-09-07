export default {
  favorites: {
    title: 'My Favorites',
    icon: 'star',
    selector: state => state.favorites.sortBy(ptr => ptr.entry).toArray()
  },
  searchResults: {
    title: 'Search results',
    icon: 'search',
    selector: state => state.search.results.sortBy(ptr => ptr.entry).toArray()
  }
};
