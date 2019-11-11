import { PlainContext } from './format';
import { translate } from './translate';

let getState: (() => any) | undefined;
export let extractLocaleFromState: ((state: any) => string) | undefined;
export function t(messageId: string, context?: PlainContext): string {
  return translate(getLocale(), messageId, context);
}

export function connectTranslateFunction<S>(getStateFn: () => S, extractLocaleFromStateFn: (state: S) => string) {
  getState = getStateFn;
  extractLocaleFromState = extractLocaleFromStateFn;
}

export function getLocale() {
  if (!getState || !extractLocaleFromState) {
    return 'initialize using connectTranslateFunction(getState, mapper) before calling t()';
  }
  return extractLocaleFromState(getState());
}
