import { EventEmitter } from 'events';
import { AnyAction, Dispatch, MiddlewareAPI } from 'redux';

const storeEvents = new (class extends EventEmitter {
  onceAny(events: string[], listener: (...args: any[]) => void): this {
    const cb = (...args: any[]) => {
      events.forEach((ev) => {
        this.removeListener(ev, cb);
      });

      listener.apply(this, args);
    };

    events.forEach((ev) => {
      this.on(ev, cb);
    });
    return this;
  }
})();

export default <S>({ dispatch, getState }: MiddlewareAPI<Dispatch, S>) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
  const preActionState = getState();

  const result = next(action);

  setTimeout(() => {
    storeEvents.emit(action.type, dispatch, getState, action.payload, preActionState);
  });

  return result;
};

export type ActionListener<S> = (dispatch: Dispatch<AnyAction>, getState: () => S, payload: any, preActionState: S) => void;

export function afterAction<S>(actionType: string | string[], listener: ActionListener<S>) {
  if (Array.isArray(actionType)) {
    actionType.forEach((type) => storeEvents.on(type, listener));
  } else {
    storeEvents.on(actionType, listener);
  }
}

export function onceAfterAction<S>(actionType: string | string[], listener: ActionListener<S>) {
  if (Array.isArray(actionType)) {
    storeEvents.onceAny(actionType, listener);
  } else {
    storeEvents.once(actionType, listener);
  }
}
