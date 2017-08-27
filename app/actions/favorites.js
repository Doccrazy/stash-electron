// @flow
import { EntryPtr } from '../utils/repository';

export const ADD = 'favorites/ADD';
export const REMOVE = 'favorites/REMOVE';

export function add(ptr: EntryPtr) {
  EntryPtr.assert(ptr);
  return {
    type: ADD,
    payload: ptr
  };
}

export function remove(ptr: EntryPtr) {
  EntryPtr.assert(ptr);
  return {
    type: REMOVE,
    payload: ptr
  };
}

export function toggle(ptr: EntryPtr) {
  EntryPtr.assert(ptr);
  return (dispatch, getState) => {
    const { favorites } = getState();
    return dispatch(favorites.has(ptr) ? remove(ptr) : add(ptr));
  };
}
