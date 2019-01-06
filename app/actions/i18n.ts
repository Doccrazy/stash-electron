import { PlainContext, translate } from '../utils/i18n/translate';
import { GetState, TypedAction } from './types';
import { State } from './types/i18n';

export enum Actions {
  SET_LOCALE = 'i18n/SET_LOCALE'
}

export function setLocale(locale: string): Action {
  return {
    type: Actions.SET_LOCALE,
    payload: locale
  };
}

let getState: GetState | undefined;
export function t(messageId: string, context?: PlainContext): string {
  if (!getState) {
    return 'initialize using connectTranslateFunction(getState) before calling t()';
  }
  return translate(getState().i18n.locale, messageId, context);
}

export function connectTranslateFunction(getStateFn: GetState) {
  getState = getStateFn;
}

type Action =
  TypedAction<Actions.SET_LOCALE, string>;

export default function reducer(state: State = { locale: 'de' }, action: Action): State {
  switch (action.type) {
    case Actions.SET_LOCALE:
      return { ...state, locale: action.payload };
    default:
      return state;
  }
}
