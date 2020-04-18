import { OptionalAction, TypedAction } from './types';
import { State } from './types/nodeHistory';

export enum Actions {
  OPEN = 'nodeHistory/OPEN',
  CLOSE = 'nodeHistory/CLOSE'
}

export function open(nodeId: string): Action {
  return {
    type: Actions.OPEN,
    payload: nodeId
  };
}

export function close(): Action {
  return {
    type: Actions.CLOSE
  };
}

type Action = TypedAction<Actions.OPEN, string> | OptionalAction<Actions.CLOSE>;

export default function reducer(state: State = { open: false }, action: Action): State {
  switch (action.type) {
    case Actions.OPEN:
      return { ...state, open: true, nodeId: action.payload };
    case Actions.CLOSE:
      return { ...state, open: false, nodeId: undefined };
    default:
      return state;
  }
}
