import flatten from 'flat';

const FALLBACK_LOCALE = 'en';
let messages: { [locale: string]: { [messageId: string]: string } } = {};

function fallbacks(locale: string) {
  return [locale, locale.split('-')[0], FALLBACK_LOCALE];
}

export function getMessage(locale: string, messageId: string) {
  return (
    fallbacks(locale)
      .map((loc) => (messages[loc] || {})[`${messageId}_${process.platform}`] || (messages[loc] || {})[messageId])
      .filter((m) => !!m)[0] || messageId
  );
}

export function loadMessages(messagesByLocale: { [locale: string]: { [messageId: string]: any } }) {
  messages = Object.keys(messagesByLocale).reduce((acc, key) => ({ ...acc, [key]: flatten(messagesByLocale[key]) }), {});
}

export function loadMessagesFromContext(localesContext: __WebpackModuleApi.RequireContext) {
  const messagesByLocale = localesContext
    .keys()
    .reduce((acc, key) => ({ ...acc, [/\/([^/]+)\.\w+$/.exec(key)![1]]: localesContext(key) }), {});
  loadMessages(messagesByLocale);
}

export function getLocales() {
  return Object.keys(messages);
}

export function bestSupportedLocale(userLocale?: string) {
  if (!userLocale) {
    return FALLBACK_LOCALE;
  }
  return (
    getLocales().find((l) => l.toLowerCase() === userLocale.toLowerCase()) ||
    getLocales().find((l) => userLocale.toLowerCase().startsWith(l.toLowerCase())) ||
    FALLBACK_LOCALE
  );
}
