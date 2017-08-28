import { EntryPtr } from '../utils/repository';
import * as actions from '../actions/edit';

export default function edit(state = {}, action) {
  switch (action.type) {
    case actions.OPEN:
      if (action.payload.ptr && action.payload.parsedContent) {
        return {
          ptr: action.payload.ptr,
          parsedContent: action.payload.parsedContent,
          formState: action.payload.formState
        };
      }
      return state;
    case actions.CHANGE:
      if (action.payload) {
        return { ...state, parsedContent: action.payload };
      }
      return state;
    case actions.CHANGE_STATE:
      if (action.payload) {
        return { ...state, formState: action.payload };
      }
      return state;
    case actions.VALIDATE:
      return { ...state, validationError: action.payload };
    case actions.CLOSE:
      return {};
    default:
      return state;
  }
}
