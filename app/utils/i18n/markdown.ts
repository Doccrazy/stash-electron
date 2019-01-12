import * as React from 'react';
import * as unified from 'unified';
import * as remark from 'remark';
import * as remark2react from 'remark-react';
import * as genericExtensions from 'remark-generic-extensions';
import * as Unist from 'unist';
import { renderToFragment } from './helper';
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
  return remark().use(genericExtensions, {
    elements: {
      fa: {
        html: {
          tagName: 'span',
          children: [
            {
              type: 'element',
              tagName: 'i',
              properties: {
                className: 'fa fa-::argument::'
              }
            }
          ]
        }
      }
    }
  }).use(intlMessage, { locale }).freeze();
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
