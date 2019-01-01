import * as React from 'react';

export function renderToFragment(reactNode: React.ReactNode) {
  if (Array.isArray(reactNode)) {
    return React.createElement(React.Fragment, null, ...reactNode);
  }
  return React.createElement(React.Fragment, null, reactNode);
}
