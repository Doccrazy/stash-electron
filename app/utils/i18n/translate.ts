import IntlMessageFormat from 'intl-messageformat';
import * as React from 'react';
import { createMarkdownFormatter } from './markdown';
import { getMessage } from './message';

type Plain = string | number | Date | boolean;
type Extended = Plain | React.ReactNode;
export interface Context<T extends Extended = Extended> {
  [key: string]: T
}
export type PlainContext = Context<Plain>;

export type ReactFormatter = (context: Context<Extended>) => React.ReactNode;

let formatterCache: {[key: string]: ReactFormatter} = {};

function resolve(locale: string, prop: string, markdown?: boolean): ReactFormatter {
  const cacheKey = `${locale}##${prop}`;
  let fmt = formatterCache[cacheKey];
  if (!fmt) {
    fmt = createFormatter(locale, prop, markdown);
    formatterCache[cacheKey] = fmt;
  }
  return fmt;
}

function createFormatter(locale: string, prop: string, markdown?: boolean): ReactFormatter {
  const message = getMessage(locale, prop);
  if (markdown) {
    return createMarkdownFormatter(message, (p: string) => resolve(locale, p, false));
  }
  const intlFmt = new IntlMessageFormat(message, locale);
  return context => formatToReact(intlFmt, context);
}

function formatToReact(fmt: IntlMessageFormat, context: Context<Extended>): React.ReactNode {
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

export function translate<CT = Plain, M extends boolean = false>(locale: string, prop: string, context?: Context<CT>, markdown?: M)
  : CT extends Plain ? (M extends false ? string: React.ReactNode): React.ReactNode {
  const format = resolve(locale, prop, markdown);
  return format(context || {}) as any;
}

export function flushCache() {
  formatterCache = {};
}
