import { EventEmitter } from 'events';
import {AnyAction, Dispatch, MiddlewareAPI} from 'redux';

const storeEvents = new EventEmitter();

export default <S> ({ dispatch, getState }: MiddlewareAPI<S>) => (next: Dispatch<S>) => (action: AnyAction) => {
  const preActionState = getState();

  const result = next(action);

  setTimeout(() => {
    storeEvents.emit(action.type, dispatch, getState, action.payload, preActionState);
  });

  return result;
};

export type ActionListener<S> = (dispatch: Dispatch<S>, getState: () => S, payload: any, preActionState: S) => void;

export function afterAction<S>(actionType: string | string[], listener: ActionListener<S>) {
  if (Array.isArray(actionType)) {
    actionType.forEach(type => storeEvents.on(type, listener));
  } else {
    storeEvents.on(actionType, listener);
  }
}
