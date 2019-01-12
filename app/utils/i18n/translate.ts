import * as React from 'react';
import { Context, createPlainFormatter, Plain, ReactFormatter } from './format';
import { createMarkdownFormatter } from './markdown';
import { getMessage } from './message';

let formatterCache: {[key: string]: ReactFormatter} = {};

function resolve(locale: string, messageId: string, markdown?: boolean): ReactFormatter {
  const cacheKey = `${locale}##${messageId}`;
  let fmt = formatterCache[cacheKey];
  if (!fmt) {
    fmt = createFormatter(locale, messageId, markdown);
    formatterCache[cacheKey] = fmt;
  }
  return fmt;
}

function createFormatter(locale: string, messageId: string, markdown?: boolean): ReactFormatter {
  const message = getMessage(locale, messageId);
  if (markdown) {
    return createMarkdownFormatter(locale, message);
  }
  return createPlainFormatter(locale, message);
}

export function translate<CT = Plain, M extends boolean = false>(locale: string, messageId: string, context?: Context<CT>, markdown?: M)
  : CT extends Plain ? (M extends false ? string: React.ReactNode): React.ReactNode {
  const format = resolve(locale, messageId, markdown);
  return format(context || {}) as any;
}

export function flushCache() {
  formatterCache = {};
}
