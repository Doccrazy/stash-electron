import * as flatten from 'flat';

const FALLBACK_LOCALE = 'en';
let messages: {[locale: string]: {[messageId: string]: string}} = {};

function fallbacks(locale: string) {
  return [locale, locale.split('-')[0], FALLBACK_LOCALE];
}

export function getMessage(locale: string, messageId: string) {
  return fallbacks(locale).map(loc => (messages[loc] || {})[messageId]).filter(m => !!m)[0] || messageId;
}

export function loadMessages(messagesByLocale: {[locale: string]: {[messageId: string]: any}}) {
  messages = Object.keys(messagesByLocale).reduce((acc, key) => ({...acc, [key]: flatten(messagesByLocale[key])}), {});
}

interface WebpackContext {
  keys(): string[]
  (key: string): any
}

export function loadMessagesFromContext(localesContext: WebpackContext) {
  const messagesByLocale = (localesContext.keys() as string[])
    .reduce((acc, key) => ({...acc, [key.match(/\/([^\/]+)\.\w+$/)![1]]: localesContext(key)}), {});
  loadMessages(messagesByLocale);
}
