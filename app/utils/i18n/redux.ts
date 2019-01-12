import { PlainContext } from './format';
import { translate } from './translate';

let extractLocaleFromState: (() => string) | undefined;
export function t(messageId: string, context?: PlainContext): string {
  if (!extractLocaleFromState) {
    return 'initialize using connectTranslateFunction(getState) before calling t()';
  }
  return translate(extractLocaleFromState(), messageId, context);
}

export function connectTranslateFunction(extractLocaleFromStateFn: () => string) {
  extractLocaleFromState = extractLocaleFromStateFn;
}
