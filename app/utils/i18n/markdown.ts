import * as React from 'react';
import unified from 'unified';
import remark from 'remark';
import remark2react from 'remark-react';
import * as Unist from 'unist';
import { renderToFragment } from './helper';
import remarkFontAwesome from './remarkFontAwesome';
import { createIntlMessageHandler, intlMessage, REACT_ELEMENT_TYPE } from './remarkIntlMessage';
import { Context, ReactFormatter } from './format';

export function createMarkdownFormatter(locale: string, message: string): ReactFormatter {
  const proc = processor(locale);
  const tree = proc.runSync(proc.parse(message));

  return context => React.createElement('div', { className: 'markdown-block' }, renderToReact(tree, context));
}

const processors: {[locale: string]: unified.Processor} = {};

function processor(locale: string) {
  let result = processors[locale];
  if (!result) {
    result = createProcessor(locale);
    processors[locale] = result;
  }
  return result;
}

function createProcessor(locale: string) {
  return remark().use(remarkFontAwesome).use(intlMessage, { locale }).freeze();
}

let localCtx: Context | null;
const renderer = unified().use(remark2react, {
  toHast: {
    handlers: createIntlMessageHandler(() => localCtx)
  },
  sanitize: false,
  createElement: (name: any, props: any, children: any) => {
    return name === REACT_ELEMENT_TYPE ? renderToFragment(props.element.react, { key: props.key }) : React.createElement(name, props, children);
  }
}).freeze();

function renderToReact(tree: Unist.Node, context: Context) {
  localCtx = context;
  const result = renderer.stringify(tree);
  localCtx = null;
  return result;
}
