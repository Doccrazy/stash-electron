// @flow
import { Set } from 'immutable';
import { EntryPtr } from '../utils/repository';

const ADD = 'favorites/ADD';
const REMOVE = 'favorites/REMOVE';

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

export default function reducer(state: Set<string> = new Set(), action: { type: string, payload: any }) {
  switch (action.type) {
    case ADD:
      return state.add(action.payload);
    case REMOVE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
