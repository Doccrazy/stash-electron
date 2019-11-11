import * as Unist from 'unist';
import * as map from 'unist-util-map';
import * as trimLines from 'trim-lines';
import { createPlainFormatter, ReactFormatter } from './format';

interface Options {
  locale: string
}
const INTL_MESSAGE_TYPE = 'intlMessage';
export const REACT_ELEMENT_TYPE = 'reactElement';

/**
 * Map all 'text' elements in the markdown to IntlMessageFormat to enable formatting / context values
 */
export const intlMessage = (options: Options) => (tree: Unist.Parent) =>
  map(tree, node => node.type === 'text' ? processText(options.locale, node as Unist.Literal) : node);

interface IntlNode extends Unist.Node {
  formatter: ReactFormatter;
}

function processText(locale: string, node: Unist.Literal): IntlNode {
  return { ...node, type: INTL_MESSAGE_TYPE, value: undefined, formatter: createPlainFormatter(locale, trimLines(node.value)) };
}

/**
 * Create a mdast-util-to-hast handler that can process intlMessage nodes
 * @param contextProvider provider for context passed to IntlMessageFormat
 */
export function createIntlMessageHandler(contextProvider: () => any) {
  return {
    [INTL_MESSAGE_TYPE]: (h: any, node: IntlNode) => h.augment(node, {
      // object-valued properties are passed through, but arrays are not, so wrap the rendered react node twice
      type: 'element', tagName: REACT_ELEMENT_TYPE, properties: { element: { react: node.formatter(contextProvider()) } }
    })
  };
}
