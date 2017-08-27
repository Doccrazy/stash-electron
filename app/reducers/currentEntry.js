import { EntryPtr } from '../utils/repository';
import * as actions from '../actions/currentEntry';

export default function currentEntry(state = {}, action) {
  switch (action.type) {
    case actions.SELECT:
      if (action.payload instanceof EntryPtr) {
        return { ptr: action.payload };
      }
      return state;
    case actions.READ:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case actions.CLEAR:
      return {};
    default:
      return state;
  }
}
