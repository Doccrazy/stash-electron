import IntlMessageFormat from 'intl-messageformat';
import * as React from 'react';

export type Plain = string | number | Date | boolean;
type Extended = Plain | React.ReactNode;
export interface Context<T extends Extended = Extended> {
  [key: string]: T
}
export type PlainContext = Context<Plain>;

export type ReactFormatter = (context: Context<Extended>) => React.ReactNode;

export function createPlainFormatter(locale: string, message: string): ReactFormatter {
  const intlFmt = new IntlMessageFormat(message, locale, customFormats);
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

const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };
const TIME_FORMAT = { hour: '2-digit', minute: 'numeric' };
const TIME_FORMAT_MEDIUM = { ...TIME_FORMAT, second: 'numeric' };

const customFormats = {
  date: {
    short: DATE_FORMAT,
    shortTime: {
      ...DATE_FORMAT,
      ...TIME_FORMAT
    },
    shortTimeMedium: {
      ...DATE_FORMAT,
      ...TIME_FORMAT_MEDIUM
    }
  },
  time: {
    short: TIME_FORMAT,
    medium: TIME_FORMAT_MEDIUM
  }
};
