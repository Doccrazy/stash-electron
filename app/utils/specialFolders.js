export default {
  favorites: {
    title: 'My Favorites',
    icon: 'star',
    selector: state => state.favorites.sortBy(ptr => ptr.entry).toArray()
  }
};
