import { Set } from 'immutable';
import EntryPtr from '../domain/EntryPtr';
import {Action, Thunk} from './types/index';
import {State} from './types/favorites';

const ADD = 'favorites/ADD';
const REMOVE = 'favorites/REMOVE';

export function add(ptr: EntryPtr): Action<EntryPtr> {
  return {
    type: ADD,
    payload: ptr
  };
}

export function remove(ptr: EntryPtr): Action<EntryPtr> {
  return {
    type: REMOVE,
    payload: ptr
  };
}

export function toggle(ptr: EntryPtr): Thunk<any> {
  return (dispatch, getState) => {
    const { favorites } = getState();
    return dispatch(favorites.has(ptr) ? remove(ptr) : add(ptr));
  };
}

export default function reducer(state: State = Set(), action: Action<any>): State {
  switch (action.type) {
    case ADD:
      return state.add(action.payload);
    case REMOVE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
