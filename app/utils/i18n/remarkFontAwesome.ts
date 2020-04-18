import genericExtensions from 'remark-generic-extensions';
import { PluggableList } from 'unified';

// adds support for !fa(icon-name) syntax to remark, rendered as <i> tag
const remarkFontAwesome: PluggableList = [
  [
    genericExtensions,
    {
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
    }
  ]
];

export default remarkFontAwesome;
