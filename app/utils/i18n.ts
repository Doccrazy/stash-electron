import IntlMessageFormat from 'intl-messageformat';
import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';

// @ts-ignore
const localesContext = require.context('../locale', false, /^.*\.js$/);

export interface PlainContext {
  [key: string]: string | number | Date | boolean
}
export interface Context {
  [key: string]: PlainContext['any'] | React.ReactNode
}

type ReactFormatter = (context: Context) => React.ReactNode;

const MESSAGE_CACHE: {[key: string]: ReactFormatter} = {};
const FALLBACK_LOCALE = 'en';

const MESSAGES: {[locale: string]: {[prop: string]: string}} = (localesContext.keys() as string[])
  .reduce((acc, key) => ({...acc, [key.match(/\/([^\/]+)\.js/)![1]]: localesContext(key).default}), {});

function fallbacks(locale: string) {
  return [locale, locale.split('-')[0], FALLBACK_LOCALE];
}

function getMessage(locale: string, prop: string) {
  return fallbacks(locale).map(loc => (MESSAGES[loc] || {})[prop]).filter(m => !!m)[0] || prop;
}

function resolve(locale: string, prop: string, markdown?: boolean): ReactFormatter {
  const cacheKey = `${locale}##${prop}`;
  let fmt = MESSAGE_CACHE[cacheKey];
  if (!fmt) {
    fmt = createFormatter(locale, prop, markdown);
    MESSAGE_CACHE[cacheKey] = fmt;
  }
  return fmt;
}

function createFormatter(locale: string, prop: string, markdown?: boolean): ReactFormatter {
  const message = getMessage(locale, prop);
  if (markdown) {
    const textRenderer = (context: Context) => (props: { children: string }) => {
      return renderToFragment(formatToReact(new IntlMessageFormat(props.children, locale), context));
    };
    return context => React.createElement(ReactMarkdown, { source: message, renderers: { text: textRenderer(context) } });
  }
  const intlFmt = new IntlMessageFormat(message, locale);
  return context => formatToReact(intlFmt, context);
}

function formatToReact(fmt: IntlMessageFormat, context: Context): React.ReactNode {
  const reactKeys = Object.keys(context).filter(key => React.isValidElement(context[key]));
  if (reactKeys.length) {
    // replace all react elements by simple string placeholders
    const safeContext = { ...context, ...reactKeys.reduce((acc, key, idx) => ({...acc, [key]:  `__${idx}__`}), {}) };
    const intermediate = fmt.format(safeContext);
    // split result along placeholders, then map them back into react elements from context
    return intermediate.split(/(__\d__)/).map(part => {
      const m = part.match(/__(\d)__/);
      return m ? context[reactKeys[parseInt(m[1], 10)]] as React.ReactElement<any> : part;
    });
  } else {
    return fmt.format(context);
  }
}

export function translate(locale: string, prop: string, markdown?: boolean, context?: Context) {
  const format = resolve(locale, prop, markdown);
  return format(context || {});
}

export function translatePlain(locale: string, prop: string, context?: PlainContext): string {
  return translate(locale, prop, false, context) as string;
}

export function renderToFragment(reactNode: React.ReactNode) {
  if (Array.isArray(reactNode)) {
    return React.createElement(React.Fragment, null, ...reactNode);
  }
  return React.createElement(React.Fragment, null, reactNode);
}
