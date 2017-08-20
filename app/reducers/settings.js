import * as actions from '../actions/settings';

export default function settings(state = { }, action) {
  switch (action.type) {
    case actions.LOAD:
      return action.payload;
    default:
      return state;
  }
}
