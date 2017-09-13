import { Set } from 'immutable';
import EntryPtr from '../domain/EntryPtr';
import {TypedAction, TypedThunk} from './types/index';
import {State} from './types/favorites';

export enum Actions {
  ADD = 'favorites/ADD',
  REMOVE = 'favorites/REMOVE'
}

export function add(ptr: EntryPtr): Action {
  return {
    type: Actions.ADD,
    payload: ptr
  };
}

export function remove(ptr: EntryPtr): Action {
  return {
    type: Actions.REMOVE,
    payload: ptr
  };
}

export function toggle(ptr: EntryPtr): Thunk<any> {
  return (dispatch, getState) => {
    const { favorites } = getState();
    return dispatch(favorites.has(ptr) ? remove(ptr) : add(ptr));
  };
}

type Action =
  TypedAction<Actions.ADD, EntryPtr>
  | TypedAction<Actions.REMOVE, EntryPtr>;

type Thunk<R> = TypedThunk<Action, R>;

export default function reducer(state: State = Set(), action: Action): State {
  switch (action.type) {
    case Actions.ADD:
      return state.add(action.payload);
    case Actions.REMOVE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
