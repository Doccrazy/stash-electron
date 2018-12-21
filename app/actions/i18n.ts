import { TypedAction } from './types';
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

type Action =
  TypedAction<Actions.SET_LOCALE, string>;

export default function reducer(state: State = { locale: 'en' }, action: Action): State {
  switch (action.type) {
    case Actions.SET_LOCALE:
      return { ...state, locale: action.payload };
    default:
      return state;
  }
}
