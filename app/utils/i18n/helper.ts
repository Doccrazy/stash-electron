import * as React from 'react';

export function renderToFragment(reactNode: React.ReactNode, props?: React.Attributes | null) {
  if (Array.isArray(reactNode)) {
    return React.createElement(React.Fragment, props, ...reactNode);
  }
  return React.createElement(React.Fragment, props, reactNode);
}
