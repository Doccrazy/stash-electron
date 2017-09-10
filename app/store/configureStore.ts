import storeDev from './configureStore.dev';
import storeProd from './configureStore.prod';

export const configureStore = process.env.NODE_ENV === 'production' ? storeProd.configureStore : storeDev.configureStore;
export const history = process.env.NODE_ENV === 'production' ? storeProd.history : storeDev.history;
