import { Set } from 'immutable';
import * as actions from '../actions/favorites';

export default function favorites(state = new Set(), action) {
  switch (action.type) {
    case actions.ADD:
      return state.add(action.payload);
    case actions.REMOVE:
      return state.delete(action.payload);
    default:
      return state;
  }
}
