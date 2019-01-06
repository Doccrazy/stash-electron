import * as React from 'react';
import * as ReactMarkdown from 'react-markdown';
import * as genericExtensions from 'remark-generic-extensions';
import { renderToFragment } from './helper';
import { Context, ReactFormatter } from './translate';

export function createMarkdownFormatter(message: string, resolve: (messageId: string) => ReactFormatter): ReactFormatter {
  // render all 'text' elements in the markdown using IntlMessageFormat to enable formatting / context values
  // here 'children' refers to the actual text value of the node
  const textRenderer = (context: Context) => (props: { children: string }) => {
    // TODO not sure about supporting nested props here; let's call it a feature
    return renderToFragment(resolve(props.children)(context));
  };
  // TODO this is horribly inefficient as it parses and processes the full markdown on each render
  //  maybe look into different options like remark-react or a basic custom implementation
  return context => React.createElement(ReactMarkdown, {
    source: message,
    renderers: { 'text': textRenderer(context), 'inline-extension': inlineExtensionRenderer },
    plugins: markdownPlugins,
    className: 'markdown-block'
  });
}

const markdownPlugins = [[
  genericExtensions,
  {
    elements: {
      fa: {
        html: {
          properties: {
            icon: '::argument::'
          }
        }
      }
    },
    debug: true
  }
]];
function inlineExtensionRenderer(props: any) {
  if (props.data.hName === 'fa') {
    return React.createElement('i', { className: `fa fa-${props.data.hProperties.icon}` });
  }
  throw new Error(`Custom tag ${props.data.hName} not implemented`);
}
