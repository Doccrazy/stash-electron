import EventEmitter from 'events';

const storeEvents = new EventEmitter();

export default ({ dispatch, getState }) => next => action => {
  const preActionState = getState();

  const result = next(action);

  setTimeout(() => {
    storeEvents.emit(action.type, dispatch, getState, action.payload, preActionState);
  });

  return result;
};

export function afterAction(actionType, listener) {
  if (Array.isArray(actionType)) {
    actionType.forEach(type => storeEvents.on(type, listener));
  } else {
    storeEvents.on(actionType, listener);
  }
}
