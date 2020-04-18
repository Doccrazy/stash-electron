import * as React from 'react';

export function renderToFragment(reactNode: React.ReactNode, props?: React.Attributes | null) {
  if (Array.isArray(reactNode)) {
    return React.createElement(React.Fragment, props, ...reactNode);
  }
  return React.createElement(React.Fragment, props, reactNode);
}

export function withContext<T>(element: React.ReactElement<any>, context: React.Context<T>, value: T) {
  return React.createElement(context.Provider, { value }, element);
}

export function contextualize<P, T>(
  component: React.ComponentType<P>,
  context: React.Context<T>,
  condition: (props: P) => boolean,
  manipulator: (props: P, contextValue: T) => P
) {
  return (props: P) =>
    condition(props)
      ? React.createElement(context.Consumer, null, (valueFromContext: T) =>
          React.createElement(component, manipulator(props, valueFromContext))
        )
      : React.createElement(component, props);
}
